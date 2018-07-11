'use strict'

const Synapsis = require('synapsis')
const axios = require('axios')

const InternalIP = require('./internalIp.js')
const SharedDb = require('./sharedDb.js')
const Db = require('./db.js')
const EventEmitter = require('events').EventEmitter
const cst = require('../constants.js')

const debug = require('debug')('interdb:main')
const info = require('debug')('interdb:main:info')

const maxDbDiff = 2 * 60 * 1000 // 2 minutes

class InterDB extends EventEmitter {
  start (conf) {
    this.conf = conf
    this.ready = false

    this.clients = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      identity: this.conf.identity,
      swarm: {
        tcp: true,
        utp: false
      }
    })
    this.clients.start()

    this.clients.on('ready', () => {
      // Allow deactivation of db while in WIP
      if (this.conf.db === false) return

      this.db = new SharedDb(this)
      if (!this.localDb && this.conf.localPath) this.startLocal(this.conf.localPath)

      this.ready = true
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
      this._checkReady(() => {
        reply(null, this.db.getLastUpdate())
      })
    })

    // When a peer ask to sync db, send the local db to him
    this.clients.router(cst.DB_SYNC, (reply) => {
      this._checkReady(() => {
        reply(null, { db: this.db.getDatabase(), shasum: this.db.getShaSum() })
      })
    })

    // When a peer ask to update with new db, update local db
    this.clients.router(cst.DB_UPDATE, (data) => {
      debug('DB_UPDATE: received new db')
      let lastUpdateNetwork = data.lastUpdate
      if (lastUpdateNetwork > Date.now() + maxDbDiff || lastUpdateNetwork < Date.now() - maxDbDiff) {
        info('TOO MANY DIFFERENCE, ABORTED')
        return
      }
      this._checkReady(() => {
        this.db.updateAll(data, () => {
          this.clients.broadcast(cst.DB_UPDATED, this.db.getLastUpdate()) // Broadcast to all connected peers
          this.emit('refreshed')
        })
      })
    })

    this.clients.router(cst.DB_UPDATED, (data) => {
      debug('DB_UPDATED: someone updated his db')
      if (this.db.getLastUpdate() < data) {
        if (data > Date.now() + maxDbDiff || data < Date.now() - maxDbDiff) {
          info('TOO MANY DIFFERENCE, ABORTED')
          return
        }
        this.once('synced', () => {
          this.emit('refreshed')
        })
        this.syncDatabase()
      } else {
        info('wont do anything with it')
      }
    })

    if (this.conf.hub) {
      debug('init hub')

      this._postToHub()
      this._getAndInjectFromHub()
    }
  }

  startLocal (localPath) {
    this.localDb = new Db(localPath)
  }

  stop (cb) {
    this.ready = false
    this.db = undefined
    if (this.clients) {
      this.clients.stop(() => {
        delete this.clients
        if (typeof cb === 'function') return cb()
      })
    } else {
      if (typeof cb === 'function') return cb()
    }
  }

  syncDatabase () {
    let lastUpdates = []
    const peersNumber = this.clients.getPeers().length

    this.clients.broadcast(cst.DB_LASTUPDATE, (err, res, client) => {
      debug('asking DB_LAST_UPDATE')
      if (err) return console.log(err)

      lastUpdates.push({ id: client.id, identity: client.identity, lastUpdate: res })
      if (lastUpdates.length === peersNumber) {
        lastUpdates.sort((a, b) => {
          return (a.lastUpdate - b.lastUpdate)
        })
        if (lastUpdates[0].lastUpdate <= this.db.getLastUpdate()) {
          debug('synced with himself')
          this.emit('synced', this.conf.identity)
          return
        }
        this.clients.send(lastUpdates[0].id, cst.DB_SYNC, (err, res, identity) => {
          if (err) return console.log(err)

          if (this.db.getShaSum(res.db.data) !== res.shasum) return this.syncDatabase()
          this.db.updateAll(res.db, () => {
            debug('synced with another one')
            this.emit('synced', lastUpdates[0].identity)
          })
        })
      }
    })
  }

  _getAndInjectFromHub (cb) {
    axios.get(`${this.conf.hub}/${this.conf.namespace}`).then(res => {
      debug(res.data)
      debug(`getted hosts from hub: ${res.data.value.length}`)
      res.data.value.forEach(host => {
        let fHost = {}
        if (host.indexOf(':') !== -1) {
          host = host.split(':')
          fHost.ip = host[0]
          fHost.port = host[1]
        } else {
          fHost.ip = host
        }

        // inject into discovery
        if (this.clients && this.clients.command_swarm && this.clients.command_swarm._discovery) {
          debug('Injecting', fHost.ip)
          this.clients.command_swarm.addPeer(this.conf.namespace, fHost)
        } else {
          debug('Cannot inject')
        }
      })
      if (typeof cb === 'function') {
        cb(null, res.data.value)
      }
    }).catch(err => {
      debug('Cannot get', err)
      if (typeof cb === 'function') {
        cb(err)
      }
    })
  }

  _postToHub (cb) {
    axios.put(`${this.conf.hub}/${this.conf.namespace}/${InternalIP()}`, {}).then(res => {
      debug(`ip sent, added: ${res.data.value}`)
      if (typeof cb === 'function') {
        cb(null, !!res.data.value)
      }
    }).catch(err => {
      debug('Cannot send', err)
      if (typeof cb === 'function') {
        cb(err)
      }
    })
  }

  _checkReady (cb) {
    if (this.ready) return cb()
    else this.once('ready', () => cb())
  }
}

module.exports = InterDB
