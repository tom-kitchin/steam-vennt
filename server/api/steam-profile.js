import { Router } from 'express'
import steam from '~/assets/steam'

const router = Router()

/* GET steam profile games by ID. */
router.get('/steam-profile/:steamid/games', function (req, res, next) {
  steam.server.getSteamOwnedGames(req.params.steamid).then((data) => {
    res.json(data)
  })
})

export default router
