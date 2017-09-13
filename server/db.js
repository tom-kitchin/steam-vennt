const Database = require('better-sqlite3')
const _ = require('lodash')

const DBPATH = 'vennt.sqlite3'

function open (call) {
  let db = new Database(DBPATH)
  call(db)
  db.close()
}

function initialize () {
  let db = new Database(DBPATH)
  db.prepare('CREATE TABLE games (id INTEGER PRIMARY KEY, appid INTEGER, name TEXT, tags TEXT)').run()
  db.close()
}

function addGame ({ appId, name, tags }) {
  let db = new Database(DBPATH)
  db.prepare('INSERT INTO games (appid, name, tags) VALUES (@appId, @name, @tags)').run({ appId, name, tags: _.join(tags, ',') })
  db.close()
}

function getTagsForGame (appId) {
  let db = new Database(DBPATH)
  let game = db.prepare('SELECT * FROM games WHERE appid = ?').get([appId])
  db.close()
  return _.split(game.tags, ',')
}

function getTagsForGames (appIds) {
  let db = new Database(DBPATH)
  let games = db.prepare(`SELECT * FROM games WHERE appid IN (${_.join(appIds, ',')})`).all()
  db.close()
  return _(games).map(function (game) {
    return [game.appid, _.split(game.tags, ',')]
  }).fromPairs().value()
}

function loadGamesFromSteamSpyJson (data) {
  let db = new Database(DBPATH)
  let statement = db.prepare('INSERT INTO games (appid, name, tags) VALUES (@appId, @name, @tags)')
  _.each(data, function (game) {
    statement.run({ appId: game.appid, name: game.name, tags: _(game.tags).keys().join(',') })
  })
  db.close()
}

module.exports = {
  open,
  initialize,
  addGame,
  getTagsForGame,
  getTagsForGames,
  loadGamesFromSteamSpyJson
}
