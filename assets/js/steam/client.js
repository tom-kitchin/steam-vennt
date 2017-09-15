import axios from 'axios'
import _ from 'lodash'

export default {
  getSteamOwnedGames (steamId) {
    return axios.get(`/api/steam-profile/${steamId}/games`)
  },
  getSteamProfiles (steamIds) {
    let steamIdString = _.join(steamIds, ',')
    return axios.get(`/api/steam-profile/${steamIdString}`)
  },
  getSteamFriendList (steamId) {
    return axios.get(`/api/steam-profile/${steamId}/friends`)
  }
}
