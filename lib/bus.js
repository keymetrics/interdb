'use strict'

const EventEmitter = require('events')
const os = require('os')
const net = require('net')
const crypto = require('crypto')

class Bus extends EventEmitter {
  constructor (interdb) {
    super()
    this.interdb = interdb
  }

  start () {
    this._srv = net.createServer().on('connection', this._onConnection)
    this._srv.listen(this.interdb.port || process.env.PORT)
  }

  _onConnection (conn) {
    console.log('new connec')
    conn.once('data', data => {
      conn.hostname = data.toString()
      conn.on('data', data => {
        
      })
    })
  }
}

module.exports = Bus
