'use strict'

const fs = require('fs')

class Db {
  constructor (interdb) {
    this.interdb = interdb
    this.path = interdb.conf.path || './database'

    if (fs.existsSync(this.path)) {
      let data = fs.readFileSync(this.path)

      try {
        data = JSON.parse(data)
      } catch (err) {
        throw err
      }
      this.db = data
      return
    }

    this.db = {
      lastUpdate: Date.now(),
      data: {}
    }
    fs.writeFileSync(this.path, JSON.stringify(this.db))
  }

  // Data

  get (key) {
    return this.db.data[key]
  }

  put (key, value, cb) {
    this.db.data[key] = value
    this.db.lastUpdate = Date.now()
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      cb(err)
    })
    this.clients.broadcast('command:updateDb', this.db)
  }

  del (key, cb) {
    delete this.db.data[key]
    this.db.lastUpdate = Date.now()
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      cb(err)
    })
    this.clients.broadcast('command:updateDb', this.db)
  }

  updateAll (db, cb) {
    if (this.getLastUpdate() < db.lastUpdate) {
      this.db = db
      fs.writeFile(this.path, JSON.stringify(this.db), err => {
        if (typeof cb === 'function') return cb(err)
      })
    }
  }

  // Timestamp

  getLastUpdate () {
    return this.db.lastUpdate
  }
}

module.exports = Db
