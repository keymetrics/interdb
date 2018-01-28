'use strict'

const Database = require('./db.js')
const Synapsis = require('synapsis')
const os = require('os')
const EventEmitter = require('events').EventEmitter
const cst = require('../constants.js');

class InterDB extends EventEmitter {
  constructor (conf) {
    super();
    this.conf = conf
    this.clients = new Synapsis({
      namespace: this.conf.namespace,
      password: this.conf.password,
      identity: this.conf.identity
    })
  }

  start () {

    this.clients.start();

    this.clients.on('ready', () => {
      this.emit('ready')
    })

    // Allow deactivation of db while in WIP
    if (this.conf.db === false) return;

    this.db = new Database(this)

    // Wait a bit before asking database
    setTimeout(() => {
      var peer = this.clients.getPeers()[0];
      if (!peer) return false;

      this.clients.send(peer.id, cst.SYNC_DATABASE, (err, res, identity) => {
        console.log(`Res received from peer ${identity}`);
      })
    }, 1000);

    /**
     * Routes
     */
    // When a peer ask to sync db, send the local db to him
    this.clients.router(cst.SYNC_DATABASE, (res, reply) => {
      reply(null, { my : { awersome : { db : ''}}})
    })

    // When a peer ask to update with new db, update local db
    this.clients.router(cst.UPDATE_DATABASE, (data) => {
      this.db.updateAll(data, () => {
        this.emit('interdb:db:refreshed');
      })
    })
  }

  stop () {
    this.db = undefined
    this.clients.stop()
  }
}

module.exports = InterDB
