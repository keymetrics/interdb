'use strict'

const Database = require('./db.js')
const Clients = require('./clients.js')

class InterDB {
  constructor (conf) {
    this.conf = conf
  }

  start () {
    this.db = new Database(this)
    this.clients = new Clients(this)
  }

  stop () {
    this.db = undefined
    this.clients.stop()
  }

  reload () {
    this.stop()
    this.start()
  }
}

module.exports = InterDB
