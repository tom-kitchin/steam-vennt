const Database = require('better-sqlite3')
const _ = require('lodash')

const DBPATH = 'vennt.sqlite3'

// Higher order function - returns a function that always runs in a transaction
function openTransaction (call) {
  let db = new Database(DBPATH)
  db.prepare('BEGIN').run()
  try {
    call(db)
    db.prepare('COMMIT').run()
  } catch (e) {
    console.error(e)
    db.prepare('ROLLBACK').run()
  } finally {
    if (db.inTransaction) db.prepare('ROLLBACK').run()
    db.close()
  }
}

function open (call) {
  let db = new Database(DBPATH)
  try {
    call(db)
  } catch (e) {
    console.error(e)
  } finally {
    db.close()
  }
}

function initialize () {
  open((db) => {
    db.prepare('CREATE TABLE games (id INTEGER PRIMARY KEY, appid INTEGER, name TEXT, tags TEXT)').run()
  })
}

function insertOrUpdateGame ({ appId, name, tags }) {
  open((db) => {
    let game = db.prepare('SELECT appid FROM games WHERE appid = ?').get([appId])
    if (game) {
      db.prepare('UPDATE games SET tags = @tags where appid = @appId').run({ appId, tags: _.join(tags, ',') })
    } else {
      db.prepare('INSERT INTO games (appid, name, tags) VALUES (@appId, @name, @tags)').run({ appId, name, tags: _.join(tags, ',') })
    }
  })
}

function getTagsForGame (appId) {
  let game
  open((db) => {
    game = db.prepare('SELECT * FROM games WHERE appid = ?').get([appId])
  })
  return _.split(game.tags, ',')
}

function getTagsForGames (appIds) {
  let games
  open((db) => {
    games = db.prepare(`SELECT * FROM games WHERE appid IN (${_.join(appIds, ',')})`).all()
  })
  return _(games).map(function (game) {
    return [game.appid, _.split(game.tags, ',')]
  }).fromPairs().value()
}

function loadGamesFromSteamSpyJson (data) {
  openTransaction((db) => {
    let appIds = db.prepare('SELECT appid FROM games').all()

    // Update any existing values.
    let updateStatement = db.prepare('UPDATE games SET name = @name, tags = @tags where appid = @appId')
    _.each(appIds, ({ appid }) => {
      if (data[appid]) {
        let game = data[appid]
        let tags = filterTagsByVotes(game.tags)
        updateStatement.run({ appId: game.appid, name: game.name, tags: _(tags).keys().join(',') })
        delete data[appid]
      }
    })

    // Create new values.
    let setStatement = db.prepare('INSERT INTO games (appid, name, tags) VALUES (@appId, @name, @tags)')
    _.each(data, function (game) {
      let tags = filterTagsByVotes(game.tags)
      setStatement.run({ appId: game.appid, name: game.name, tags: _(tags).keys().join(',') })
    })
  })
}

function filterTagsByVotes (tags) {
  let highestVotes = _.max(_.values(tags))
  let voteCutoff = highestVotes * 0.25 // Gotta have at least 25% of the votes of the most voted one.
  return _.pickBy(tags, (votes) => votes > voteCutoff)
}

module.exports = {
  open,
  initialize,
  insertOrUpdateGame,
  getTagsForGame,
  getTagsForGames,
  loadGamesFromSteamSpyJson
}
