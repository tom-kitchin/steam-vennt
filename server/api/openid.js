import { Router } from 'express'
import { Strategy } from 'passport-openid'
import passport from 'passport'

const router = Router()

let serverUrl = process.env.BASE_URL || 'localhost:3000'

let steamStrategy = new Strategy({
  providerURL: 'http://steamcommunity.com/openid',
  returnURL: `${serverUrl}/api/openid/steam/return`,
  realm: serverUrl,
  stateless: true
}, function (identifier, done) {
  try {
    let steamId = identifier.match(/^http:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/)[1]
    if (steamId) {
      return done(null, { steamId })
    } else {
      return done(null, false)
    }
  } catch (e) {
    return done(e, null)
  }
})

passport.use(steamStrategy)

app.use(passport.initialize())

router.post('/openid/steam', passport.authenticate('openid'))

router.get(
  '/openid/steam/return',
  function(req, res, next) {
    // Middleware to fix bug in openid path check.
    req.url = req.originalUrl
    next()
  },
  passport.authenticate('openid'),
  function (req, res) {
    if (req.user) {
      res.redirect(`/${req.user.steamId}`)
    } else {
      response.redirect(`/`)
    }
  }
)

export default router
