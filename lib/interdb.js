'use strict'

const Database = require('./db.js')
const Synapsis = require('synapsis')
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

    // Listen to a new peer that wants to sync the db
    this.clients.router('interdb:command:sync', (res, reply) => {
      //console.log('ive received the query!');
      reply(null, { my : { awersome : { db : ''}}})
    })

    setTimeout(() => {
      var peer = this.clients.getPeers()[0];
      if (!peer) return false;

      //console.log(peer.identity);
      this.clients.send(peer.id, 'interdb:command:sync', { data : true }, (err, res, identity) => {
        //console.log(err, res, identity);
      })
    }, 1000);

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
