'use strict'

const SharedDb = require('./sharedDb.js')
const Db = require('./db.js')
const Synapsis = require('synapsis')
const EventEmitter = require('events').EventEmitter
const cst = require('../constants.js')

class InterDB extends EventEmitter {
  constructor (conf) {
    super()
    this.conf = conf
  }

  start () {
    this.clients = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      identity: this.conf.identity
    })
    this.clients.start()

    this.clients.on('ready', () => {
      // Allow deactivation of db while in WIP
      if (this.conf.db === false) return

      this.db = new SharedDb(this)
      if (this.conf.localPath) this.localDb = new Db(this.conf.localPath)

      this.emit('ready')

      this.clients.once('peer:connected', (identity, socket) => {
        this.syncDatabase()
      })
    })

    /**
     * Routes
     */
    // When a peer ask last update of db, send the last update to him
    this.clients.router(cst.DB_LASTUPDATE, (reply) => {
      reply(null, this.db.getLastUpdate())
    })

    // When a peer ask to sync db, send the local db to him
    this.clients.router(cst.DB_SYNC, (reply) => {
      reply(null, { db: this.db.getDatabase(), shasum: this.db.getShaSum() })
    })

    // When a peer ask to update with new db, update local db
    this.clients.router(cst.DB_UPDATE, (data) => {
      this.db.updateAll(data, () => {
        this.emit('refreshed')
      })
    })
  }

  stop (cb) {
    this.db = undefined
    this.clients.stop(() => {
      delete this.clients
      if (typeof cb === 'function') return cb()
    })
  }

  syncDatabase () {
    let lastUpdates = []
    const peersNumber = this.clients.getPeers().length

    this.clients.broadcast(cst.DB_LASTUPDATE, (err, res, identity) => {
      if (err) return console.log(err)

      lastUpdates.push({ id: identity.id, lastUpdate: res })
      if (lastUpdates.length === peersNumber) {
        lastUpdates.sort((a, b) => {
          return (a.lastUpdate - b.lastUpdate)
        })
        if (lastUpdates[0].lastUpdate <= this.db.getLastUpdate()) return this.emit('synced')
        this.clients.send(lastUpdates[0].id, cst.DB_SYNC, (err, res, identity) => {
          if (err) return console.log(err)

          if (this.db.getShaSum(res.db.data) !== res.shasum) return this.syncDatabase()
          this.db.updateAll(res.db, () => {
            this.emit('synced')
          })
        })
      }
    })
  }
}

module.exports = InterDB
