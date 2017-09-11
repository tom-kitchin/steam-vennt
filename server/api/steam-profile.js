import { Router } from 'express'
import _ from 'lodash'
import { server as steam } from '~/assets/js/steam'

const router = Router()

/* GET steam profile by ID. */
router.get('/steam-profile/:steamids', function (req, res, next) {
  let steamIds = _.split(req.params.steamids, ',')
  steam.getSteamProfiles(steamIds).then((data) => {
    res.json(data)
  })
})

/* GET steam profile games by ID. */
router.get('/steam-profile/:steamid/games', function (req, res, next) {
  steam.getSteamOwnedGames(req.params.steamid).then((data) => {
    res.json(data)
  })
})

/* GET friends of steam id by ID. */
router.get('/steam-profile/:steamid/friends', function (req, res, next) {
  steam.getSteamFriendList(req.params.steamid).then((data) => {
    res.json(data)
  })
})

export default router
