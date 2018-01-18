'use strict'

const EventEmitter = require('events')
const os = require('os')
const crypto = require('crypto')

const swarm = require('discovery-swarm')

class Clients extends EventEmitter {
  constructor (interdb) {
    super()
    this.interdb = interdb
  }

  start () {
    this.sw = swarm({
      id: this.interdb.hostname || os.hostname(),
      utp: false,
      tcp: true,
      maxConnections: 200
    })
    this.sw.listen(this.interdb.port)
    this.sw.join(this.interdb.namespace)

    this.sw.on('connection', (conn, info) => {
      let hostname = info.id.toString()
      if (this._getUnauthorizedConn(hostname)) return
      conn.hostname = hostname
      conn.handshake = Date.now()
      conn.queue = []
      conn.send = (action, data) => {
        let key = this.interdb.db._getKey(hostname)
        let string = JSON.stringify({ action, data })

        if (!key) {
          conn.queue.push({ action, data })
          return false
        }
        if (!conn.verified && action !== 'askHandshake' && action !== 'answerHandshake') return false
        console.log('send to', hostname, { action, data })
        conn.write(crypto.publicEncrypt(key, Buffer.from(string)))
        return true
      }
      console.log('connection', conn.hostname)
      this.emit('connection', conn.hostname)
      conn.send('askHandshake', conn.handshake)

      conn.on('data', data => {
        let r = crypto.privateDecrypt(this.interdb.privateKey, data).toString()
        try {
          r = JSON.parse(r)
          console.log('recv from', conn.hostname, r)
        } catch (e) {
          console.log(e)
          return
        }
        switch (r.action) {
          case 'askHandshake': {
            conn.send('answerHandshake', r.data)
            break
          }
          case 'answerHandshake': {
            if (r.data === conn.handshake) {
              conn.verified = true
              console.log('emit verified')
              this.emit('verified', conn.hostname)
              this._sendQueue(conn.hostname)
            } else {
              conn.end()
              console.log('badHandshake')
            }
            break
          }
        }
      })
    })

    this.sw.on('drop', conn => {
      console.log('Dropped', conn.hostname, this.sw.connections.length)
    })
  }

  _sendQueue (hostname) {
    let conn = this._getAuthorizedConn(hostname)
    conn.queue.forEach(msg => {
      conn.send(msg.action, msg.data)
    })
    return true
  }

  _getConn (hostname) {
    let conns = this.sw.connections

    for (let i = 0; i < conns.length; i++) {
      let conn = conns[i]
      if (conn.hostname === hostname) {
        return conn
      }
    }
    return null
  }

  _getUnauthorizedConn (hostname) {
    return this._getConn(hostname)
  }

  _getAuthorizedConn (hostname) {
    let conn = this._getConn(hostname)
    if (conn.verified) return conn
    return null
  }
}

module.exports = Clients
