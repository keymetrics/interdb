'use strict'

const cst = require('../constants.js')
const Db = require('./db.js')

class SharedDb extends Db {
  constructor (interdb) {
    super(interdb.conf.path)

    this.interdb = interdb
  }

  broadcastDB () {
    this.interdb.clients.broadcast(cst.DB_UPDATE, this.db)
  }

  // Data

  put (key, value, cb) {
    super.put(key, value, err => {
      if (err) cb(err)

      this.broadcastDB()
      cb()
    })
  }

  del (key, cb) {
    super.del(key, err => {
      if (err) cb(err)

      this.broadcastDB()
      cb()
    })
  }

  push (key, value, cb) {
    super.push(key, value, err => {
      if (err) cb(err)

      this.broadcastDB()
      cb()
    })
  }
}

module.exports = SharedDb
