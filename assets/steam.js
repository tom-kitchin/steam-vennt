import axios from 'axios'

function isSteamKeySet () {
  return !!process.env.STEAM_API_KEY
}

function resolveVanityUrl (steamVanityId) {
  return axios.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
    params: { key: process.env.STEAM_API_KEY, vanityurl: steamVanityId }
  }).then(({ data }) => {
    return data.response
  })
}

function getOwnedGames (steamId) {
  return axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
    params: { key: process.env.STEAM_API_KEY, steamid: steamId, include_appinfo: '1' }
  }).then(({ data }) => {
    return data.response
  })
}

let server = {
  getSteamOwnedGames (steamId) {
    if (isSteamKeySet()) {
      return getOwnedGames(steamId).catch(() => {
        // Maybe it's a vanity ID?
        return resolveVanityUrl(steamId).then((response) => {
          return getOwnedGames(response.steamid).then((response) => {
            return response
          })
        }).catch(() => {
          return {
            error: `Failed to load steam ID '${steamId}'`
          }
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
