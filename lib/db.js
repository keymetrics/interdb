'use strict'

const fs = require('fs')

class Db {
  constructor (path = './database') {
    this.path = path
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
      data: {},
      keys: {}
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
  }

  del (key, cb) {
    delete this.db.data[key]
    this.db.lastUpdate = Date.now()
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      cb(err)
    })
  }

  // Public keys

  getKeys () {
    return this.db.keys
  }

  getKey (hostname) {
    return this.db.keys[hostname]
  }

  putKey (hostname, key, cb) {
    this.db.keys[hostname] = key
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      cb(err)
    })
  }

  delKey (hostname, cb) {
    delete this.db.keys[hostname]
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      cb(err)
    })
  }

  // Timestamp

  getLastUpdate () {
    return this.db.lastUpdate
  }
}

module.exports = Db
