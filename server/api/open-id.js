import { Router } from 'express'
import { Strategy } from 'passport-openid'
import passport from 'passport'

const router = Router()

let steamStrategy = new Strategy({
  providerURL: 'http://steamcommunity.com/openid',
  stateless: true,
  returnURL: '/api/openid/steam/return',
  realm: 'https://vennt.twodaemon.co.uk/'
}, function (identifier, done) {
  let steamId = identifier.match(/http:\/\/steamcommunity.com\/openid\/id\/(\d+)$/)[1]
  if (steamId) {
    return done(null, steamId)
  } else {
    return done(null, false)
  }
})

passport.use(steamStrategy)

router.post('/openid/steam', passport.authenticate('openid'))

router.get(
  '/openid/steam/respond',
  passport.authenticate('openid'),
  function (request, response) {
    console.log(request)
  }
)

export default router
