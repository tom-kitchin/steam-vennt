import { Router } from 'express'
import apicache from 'apicache'
import _ from 'lodash'
import steam from '~/assets/js/steam/server'

const router = Router()
const cache = apicache.middleware
const is200 = (req, res) => res.statusCode === 200

/* GET steam profile by ID. */
router.get(
  '/steam-profile/:steamids',
  // cache('10 minutes', function (req, res) {
  //   if (_.isArray(res.data) && _.some(res.data, (profile) => profile.error)) {
  //     // Don't cache if we grabbed any erroring profiles.
  //     return false
  //   }
  //   return is200(req, res)
  // }),
  function (req, res, next) {
    let steamIds = _.split(req.params.steamids, ',')
    steam.getSteamProfiles(steamIds).then((data) => {
      if (data.error) {
        return res.status(500).json(data)
      }
      return res.json(data)
    })
  }
)

/* GET steam profile games by ID. */
router.get(
  '/steam-profile/:steamid/games',
  // cache('10 minutes', is200),
  function (req, res, next) {
    steam.getSteamOwnedGames(req.params.steamid).then((data) => {
      if (data.error) {
        return res.status(500).json(data)
      }
      return res.json(data)
    })
  }
)

/* GET friends of steam id by ID. */
router.get(
  '/steam-profile/:steamid/friends',
  // cache('1 minute', is200),
  function (req, res, next) {
    steam.getSteamFriendList(req.params.steamid).then((data) => {
      if (data.error) {
        return res.status(500).json(data)
      }
      return res.json(data)
    })
  }
)

export default router
