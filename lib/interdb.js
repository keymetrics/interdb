'use strict'

const Database = require('./db.js')

class InterDB {
  constructor (conf) {
    this.conf = conf
  }

  start () {
    this.db = new Database(this.conf.path)
  }

  stop () {

  }

  reload () {

  }
}

module.exports = InterDB
