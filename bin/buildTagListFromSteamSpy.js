#!/usr/bin/env node

let axios = require('axios')
let db = require('../server/db')

let steamSpyJson = axios.get(`http://steamspy.com/api.php`, {
  params: { request: 'all' }
}).then(({ data }) => {
  db.loadGamesFromSteamSpyJson(data)
}).catch((e) => {
  console.error(e)
})
