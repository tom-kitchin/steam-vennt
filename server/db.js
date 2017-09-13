const sqlite3 = require('sqlite3').verbose()

const DBPATH = 'vennt.sqlite3'

module.exports = {
  serialize (call) {
    let db = new sqlite3.Database(DBPATH)
    db.serialize(call(db))
    db.close()
  }
}
