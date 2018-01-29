'use strict'

const Database = require('./db.js')
const Synapsis = require('synapsis')
const EventEmitter = require('events').EventEmitter
const cst = require('../constants.js')

class InterDB extends EventEmitter {
  constructor (conf) {
    super()
    this.conf = conf
    this.clients = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      identity: this.conf.identity
    })
  }

  start () {
    this.clients.start()

    this.clients.on('ready', () => {
      this.emit('ready')
    })

    // Allow deactivation of db while in WIP
    if (this.conf.db === false) return

    this.db = new Database(this)

    // Wait a bit before asking database
    setTimeout(() => {
      this.syncDatabase()
    }, 1000)

    /**
     * Routes
     */
    // When a peer ask last update of db, send the last update to him
    this.clients.router(cst.LASTUPDATE_DATABASE, (reply) => {
      reply(null, this.db.getLastUpdate())
    })

    // When a peer ask to sync db, send the local db to him
    this.clients.router(cst.SYNC_DATABASE, (reply) => {
      reply(null, this.db.getDatabase())
    })

    // When a peer ask to update with new db, update local db
    this.clients.router(cst.UPDATE_DATABASE, (data) => {
      this.db.updateAll(data, () => {
        this.emit('interdb:db:refreshed')
      })
    })
  }

  stop () {
    this.db = undefined
    this.clients.stop()
  }

  syncDatabase () {
    const peer = this.clients.getPeers()[0]
    if (!peer) return false

    let lastUpdates = []
    const peersNumber = this.clients.getPeers().length
    this.clients.broadcast(cst.LASTUPDATE_DATABASE, (err, res, identity) => {
      if (err) return console.log(err)

      lastUpdates.push({ id: identity.id, lastUpdate: res })
      if (lastUpdates.length === peersNumber) {
        lastUpdates.sort((a, b) => {
          return (a.lastUpdate - b.lastUpdate)
        })
        this.clients.send(lastUpdates[0].id, cst.SYNC_DATABASE, (err, res, identity) => {
          if (err) return console.log(err)

          this.db.updateAll(res)
        })
      }
    })
  }
}

module.exports = InterDB
