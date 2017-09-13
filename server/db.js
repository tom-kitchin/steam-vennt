const Database = require('better-sqlite3')
import _ from 'lodash'

const DBPATH = 'vennt.sqlite3'

module.exports = {
  serialize (call) {
    let db = new Database(DBPATH)
    db.serialize(call(db))
    db.close()
  },
  initialize () {
    let db = new Database(DBPATH)
    db.prepare('CREATE TABLE games (id INTEGER PRIMARY KEY, appid INTEGER, name TEXT)').run()
    db.prepare('CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT)').run()
    db.prepare('CREATE TABLE games_tags (id INTEGER PRIMARY KEY, game_id INTEGER, tag_id INTEGER)').run()
    db.close()
  },
  addGame ({ appId, name, tags }) {
    let db = new Database(DBPATH)
    let game = db.prepare('INSERT INTO games VALUES (@appid, @name)').run({ appid, name })
    _.each(tags, (tag) => {
      let tag = db.prepare('INSERT INTO tags VALUES (?)').run(tag)
      db.prepare('INSERT INTO games_tags VALUES (@gameId, @tagId)').run({ gameId: game.lastInsertROWID, tagId: tag.lastInsertROWID })
    })
    db.close()
  }
}
