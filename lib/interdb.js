'use strict'

const Synapsis = require('synapsis')
const Database = require('./db.js')

class InterDB {
  constructor (conf) {
    this.conf = conf
    this.synapse = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      // Identity will be shared to all peers
      identity: {
        name: require('os').hostname()
      }
    })
  }

  start () {
    this.db = new Database(this.conf.path)
    this.synapse.start()

    this.synapse.on('peer:connected', (identity, socket) => {
      console.log('New peer detected', identity)
    })

    this.synapse.on('peer:disconnected', (identity) => {
      console.error(identity)
    })

    this.synapse.on('error', (err) => {
      console.error(err)
    })

    this.synapse.on('ready', () => {
      console.log('Peer Ready')
    })
  }

  broadcast (action, data) {
    this.synapse.broadcast(action, data)
  }

  on (action, cb) {
    this.synapse.router(action, (data, reply) => {
      cb(data, reply)
    })
  }

  stop () {
    this.synapse.stop()
    this.synapse = undefined
    this.db = undefined
  }

  reload () {
    this.stop()
    this.start()
  }
}

module.exports = InterDB
