import express from 'express'
import { Nuxt, Builder } from 'nuxt'

import api from './api'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

/*
** Set up openid for steam.
*/
import { Strategy } from 'passport-openid'
import passport from 'passport'

let serverUrl = process.env.BASE_URL || 'localhost:3000'

let steamStrategy = new Strategy({
  providerURL: 'http://steamcommunity.com/openid',
  returnURL: `${serverUrl}/auth/openid/steam/return`,
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

app.use(passport.initialize())
passport.use(steamStrategy)

// Import API Routes
app.use('/api', api)

// Set up steam auth routes
app.post('/auth/openid/steam', passport.authenticate('openid', { session: false }))
app.get(
  '/auth/openid/steam/return',
  function(req, res, next) {
    // Middleware to fix bug in openid path check.
    req.url = req.originalUrl
    next()
  },
  passport.authenticate('openid', { session: false }),
  function (req, res) {
    if (req.user) {
      res.redirect(`/${req.user.steamId}`)
    } else {
      response.redirect(`/`)
    }
  }
)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
