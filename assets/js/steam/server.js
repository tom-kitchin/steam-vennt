import axios from 'axios'
import Bottleneck from 'bottleneck'
import _ from 'lodash'
import db from '~/server/db'

// Rate limiting tool - 1 concurrent, 250ms gap, queue length limit 100, discard oldest when going over limit, reject promises when dropped.
let requestQueue = new Bottleneck(1, 250, 100, Bottleneck.strategy.LEAK, true)

function isSteamKeySet () {
  return !!process.env.STEAM_API_KEY
}

function isSteamIdFormat (steamId) {
  return (/^\d+$/.test(steamId))
}

function resolveVanityUrl (steamVanityId) {
  return requestQueue.schedule(axios.get, 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
    params: { key: process.env.STEAM_API_KEY, vanityurl: steamVanityId }
  }).then(({ data }) => {
    if (data.response.success !== 1) {
      // 1 is the success code? 42 seems to be the "not found" code, despite being in the 'success' key. ¯\_(ツ)_/¯
      return Promise.reject(new Error(`Steam doesn't recognise ID '${steamVanityId}'`))
    }
    return data.response
  })
}

/**
** Perhaps unexpectedly, this method wants an array of objects with keys
** 'steamId' and 'providedId'. Any other keys are kept in the output.
** We do this to hold on to what we were originally asked for through
** multiple iterations of profile lookup.
*/
function getProfiles (profiles) {
  let steamIds = _.map(profiles, (profile) => profile.steamId)
  // First just fire off a request and see what we get.
  return requestQueue.schedule(axios.get, 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
    params: { key: process.env.STEAM_API_KEY, steamids: _.join(steamIds, ',') }
  }).then(({ data }) => {
    if (_.isEmpty(data.response)) {
      // Empty response is probably a failed lookup.
      return Promise.reject(new Error(`Failed to load steam profile API`))
    }
    // There's no data in the response for unmatched players, so fill in the gaps.
    return _.map(profiles, (profile) => {
      let playerData = _.find(data.response.players, _.matches({ steamid: profile.steamId }))
      if (playerData) {
        return {
          ...profile,
          steamId: playerData.steamid,
          visibility: (playerData.communityvisibilitystate === 3) ? 'public' : 'private',
          name: playerData.personaname,
          avatar: playerData.avatar
        }
      } else {
        return {
          ...profile,
          error: `Failed to load steam profile for ID ${profile.providedId}`
        }
      }
    })
  })
}

function getOwnedGames (steamId) {
  if (!isSteamIdFormat(steamId)) {
    // If it's not all numbers, it's probably not a steam ID!
    return Promise.reject(new Error(`${steamId} doesn't look like a valid Steam ID`))
  }
  return requestQueue.schedule(axios.get, 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
    params: { key: process.env.STEAM_API_KEY, steamid: steamId, include_appinfo: '1' }
  }).then(({ data }) => {
    if (_.isEmpty(data.response)) {
      // Empty response is probably a failed lookup?
      return Promise.reject(new Error(`Failed to load game list for Steam ID '${steamId}'`))
    }
    return data.response
  })
}

function getFriendList (steamId) {
  if (!isSteamIdFormat(steamId)) {
    // If it's not all numbers, it's probably not a steam ID!
    return Promise.reject(new Error(`${steamId} doesn't look like a valid Steam ID`))
  }
  return requestQueue.schedule(axios.get, 'https://api.steampowered.com/ISteamUser/GetFriendList/v1/', {
    params: { key: process.env.STEAM_API_KEY, steamid: steamId, relationship: 'friend' }
  }).then(({ data }) => {
    if (_.isEmpty(data)) {
      // Empty response is probably a failed lookup?
      return Promise.reject(new Error(`Failed to load friend list for Steam ID '${steamId}'`))
    }
    let friendIds = _.map(data.friendslist.friends, (friend) => {
      return { providedId: friend.steamid, steamId: friend.steamid }
    })
    return getProfiles(friendIds)
  })
}

export default {
  getSteamProfiles (steamIds) {
    if (isSteamKeySet()) {
      let steamProfiles = _.map(steamIds, (steamId) => {
        return { providedId: steamId, steamId: steamId }
      })
      return getProfiles(steamProfiles).then((response) => {
        // However, some of the failed responses might have been vanity urls.
        return Promise.all(_.map(response, (profile) => {
          if (profile.error) {
            return resolveVanityUrl(profile.providedId).then((response) => {
              return {
                providedId: profile.providedId,
                steamId: response.steamid,
                providedIsVanityUrl: true
              }
            }).catch((e) => {
              return {
                providedId: profile.providedId,
                error: e.message
              }
            })
          } else {
            return Promise.resolve(profile)
          }
        })).then((profiles) => {
          if (_.some(profiles, _.matches({ providedIsVanityUrl: true }))) {
            return getProfiles(profiles)
          } else {
            return profiles
          }
        })
      }).catch((e) => { return { error: e.message } })
    } else {
      return Promise.resolve({
        error: 'Steam API key not set on server'
      })
    }
  },
  getSteamOwnedGames (steamId) {
    if (isSteamKeySet()) {
      return getOwnedGames(steamId).catch(() => {
        // Maybe it's a vanity ID?
        return resolveVanityUrl(steamId).then((response) => {
          return getOwnedGames(response.steamid)
        }).catch((e) => {
          return { error: e.message }
        })
      }).then((response) => {
        let tags = db.getTagsForGames(_.map(response.games, (game) => game.appid))
        response.games = _.map(response.games, (game) => {
          return {
            ...game,
            tags: tags[game.appid]
          }
        })
        return response
      })
    } else {
      return Promise.resolve({
        error: 'Steam API key not set on server'
      })
    }
  },
  getSteamFriendList (steamId) {
    if (isSteamKeySet()) {
      return getFriendList(steamId).catch((e) => {
        return { error: e.message }
      })
    } else {
      return Promise.resolve({
        error: 'Steam API key not set on server'
      })
    }
  },
  getIconUrl (game) {
    if (!game.img_icon_url) { return '' }
    return `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
  }
}
