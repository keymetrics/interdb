'use strict'

const Database = require('./db.js')
const Clients = require('./clients.js')
const Synapsis = require('./synapsis/synapsis.js')
const os = require('os')

class InterDB {
  constructor (conf) {
    this.conf = conf
    this.clients = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      // Identity will be shared to all peers
      identity: {
        name: this.conf.hostname || os.hostname()
      }
    })
  }

  start () {
    this.db = new Database(this)

    this.clients.start();

    this.clients.router('command:updateDb', (data) => {
      this.db.updateAll()
    })
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
