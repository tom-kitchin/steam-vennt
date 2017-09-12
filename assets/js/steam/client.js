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
  },
  getIconUrl (game) {
    if (!game.img_icon_url) { return '' }
    return `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
  }
}
