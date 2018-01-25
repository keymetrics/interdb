'use strict'

const Database = require('./db.js')
const Synapsis = require('./synapsis/synapsis.js')
const os = require('os')
const EventEmitter = require('events').EventEmitter

class InterDB extends EventEmitter {
  constructor (conf) {
    super();
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

    console.log(' asdsasad')
    this.clients.router('interdb:command:sync', (res, reply) => {
      console.log('sdfdsfdsf')
      // this.clients.broadcast('interdb:command:updateDb', this.db.getDatabase())
      reply(null, 'test')
    })

    this.clients.broadcast('interdb:command:sync', '', (err, res, identity) => {
      console.log(identity)
    })

    this.clients.router('interdb:command:updateDb', (data) => {
      this.db.updateAll(data, () => {
        this.emit('interdb:db:refreshed');
      })
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
