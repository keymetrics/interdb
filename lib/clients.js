'use strict'

const EventEmitter = require('events')
const os = require('os')
const Synapsis = require('./synapsis/synapsis.js')

class Clients extends EventEmitter {
  constructor (interdb) {
    super()
    this.interdb = interdb
    this.conf = this.interdb.conf

    this.syn = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      // Identity will be shared to all peers
      identity: {
        name: this.conf.hostname || os.hostname()
      }
    })
  }

  start () {
    this.syn.start()

    this.syn.on('peer:connected', (identity, socket) => {
      this.emit('connected', identity)
    })

    this.syn.on('peer:disconnected', (identity) => {
      this.emit('disconnected', identity)
    })

    this.syn.on('error', (err) => {
      console.error(err)
    })

    this.syn.on('ready', () => {
      this.emit('ready')
    })

    this.syn.router('command:updateDb', (db) => {
      this.interdb.db.updateAll(db)
    })
  }

  broadcast (action, data) {
    this.syn.broadcast(action, data)
  }

  send (to, action, data) {
    this.syn.send(to, action, data)
  }

  getPeers () {
    return this.syn.getPeers()
  }

  router (action, cb) {
    this.syn.router(action, (data, reply) => {
      cb(data, reply)
    })
  }

  stop () {
    this.syn.stop()
  }
}

module.exports = Clients
