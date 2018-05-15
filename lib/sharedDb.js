'use strict'

const cst = require('../constants.js')
const Db = require('./db.js')
const debug = require('debug')('interdb:shared')

class SharedDb extends Db {
  constructor (interdb) {
    super(interdb.conf.path)

    this.interdb = interdb
  }

  broadcastDB () {
    debug('broadcast database update')
    this.interdb.clients.broadcast(cst.DB_UPDATE, this.db)
  }

  save (cb, overrideBroadcast) {
    super.save(err => {
      if (err) return cb(err)

      if (!overrideBroadcast) this.broadcastDB()
      cb()
    })
  }
}

module.exports = SharedDb
