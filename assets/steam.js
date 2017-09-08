import axios from 'axios'
import Bottleneck from 'bottleneck'
import _ from 'lodash'

// Rate limiting tool - 1 concurrent, 500ms gap, queue length limit 20, discard oldest when going over limit, reject promises when dropped.
let requestQueue = new Bottleneck(1, 500, 20, Bottleneck.strategy.LEAK, true)

function isSteamKeySet () {
  return !!process.env.STEAM_API_KEY
}

function resolveVanityUrl (steamVanityId) {
  return axios.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
    params: { key: process.env.STEAM_API_KEY, vanityurl: steamVanityId }
  }).then(({ data }) => {
    if (data.response.success !== 1) {
      // 1 is the success code? 42 seems to be the "not found" code, despite being in the 'success' key. ¯\_(ツ)_/¯
      return Promise.reject(new Error(`Steam doesn't recognise ID '${steamVanityId}'`))
    }
    return data.response
  })
}

function getOwnedGames (steamId) {
  return axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
    params: { key: process.env.STEAM_API_KEY, steamid: steamId, include_appinfo: '1' }
  }).then(({ data }) => {
    if (_.isEmpty(data.response)) {
      // Empty response is probably a failed lookup?
      return Promise.reject(new Error(`Failed to load game list for Steam ID '${steamId}'`))
    }
    return data.response
  })
}

let server = {
  getSteamOwnedGames (steamId) {
    if (isSteamKeySet()) {
      return requestQueue.schedule(getOwnedGames, steamId).catch(() => {
        // Maybe it's a vanity ID?
        return requestQueue.schedule(resolveVanityUrl, steamId).then((response) => {
          return requestQueue.schedule(getOwnedGames, response.steamid).then((response) => {
            return response
          })
        }).catch((e) => {
          return { error: e.message }
        })
      })
    } else {
      return Promise.resolve({
        error: 'Steam API key not set on server'
      })
    }
  }
}

let client = {
  getSteamOwnedGames (steamId) {
    return axios.get(`/api/steam-profile/${steamId}/games`, {
      baseURL: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
    })
  }
}

export {
  server,
  client
}
