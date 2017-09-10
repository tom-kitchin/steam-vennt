import { Router } from 'express'
import { server as steam } from '~/assets/js/steam'

const router = Router()

/* GET steam profile by ID. */
router.get('/steam-profile/:steamid', function (req, res, next) {
  steam.getSteamProfile(req.params.steamid).then((data) => {
    res.json(data)
  })
})

/* GET steam profile games by ID. */
router.get('/steam-profile/:steamid/games', function (req, res, next) {
  steam.getSteamOwnedGames(req.params.steamid).then((data) => {
    res.json(data)
  })
})

export default router
