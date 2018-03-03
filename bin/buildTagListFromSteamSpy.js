#!/usr/bin/env node

let axios = require('axios')
let db = require('../server/db')
let _ = require('lodash')

let tagsToGet = [
  'Local Multiplayer',
  'Co-op',
  'Multiplayer'
]

let promiseChain = Promise.resolve()

_.each(tagsToGet, (tag) => {
  promiseChain = promiseChain.then(() => {
    return axios.get(`http://steamspy.com/api.php`, {
      params: { request: 'tag', tag }
    }).then(({ data }) => {
      db.loadGamesForTagFromSteamSpyJson(data, tag)
    }).catch((e) => {
      console.error(e)
    })
  })
})
