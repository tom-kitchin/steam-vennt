import axios from 'axios'

function isSteamKeySet () {
  return !!process.env.STEAM_API_KEY
}

export default {
  server: {
    getSteamOwnedGames (steamId) {
      if (isSteamKeySet()) {
        return axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1`).then(({ data }) => {
          return data.response
        }).catch(() => {
          return {
            error: `Failed to load steam ID '${steamId}'`
          }
        })
      } else {
        return {
          error: 'Steam API key not set on server'
        }
      }
    }
  },
  client: {
    getSteamOwnedGames (steamId) {
      return axios.get(`/api/steam-profile/${steamId}/games`, {
        baseURL: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
      })
    }
  }
}
