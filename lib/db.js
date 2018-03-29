'use strict'

const crypto = require('crypto')
const fs = require('fs')

const defaultDb = {
  lastUpdate: 0,
  data: {}
}

class Db {
  constructor (path) {
    this.path = path || './database'

    if (fs.existsSync(this.path)) {
      let data = fs.readFileSync(this.path)

      try {
        data = JSON.parse(data)
      } catch (err) {
        // emit something?
        data = defaultDb
      }
      this.db = data
      return
    }

    this.db = defaultDb
    fs.writeFileSync(this.path, JSON.stringify(this.db))
  }

  // Data

  get (key) {
    return this.db.data[key]
  }

  put (key, value, cb) {
    this.db.data[key] = value
    this.db.lastUpdate = Date.now()
    this.save(cb)
  }

  del (key, cb) {
    delete this.db.data[key]
    this.db.lastUpdate = Date.now()
    this.save(cb)
  }

  push (key, value, cb) {
    if (this.db.data[key] && !Array.isArray(this.db.data[key])) {
      return cb(new Error(`${key} is not an array`))
    }

    if (!this.db.data[key]) this.db.data[key] = []

    this.db.lastUpdate = Date.now()
    this.db.data[key].push(value)
    this.save(cb)
  }

  getDatabase () {
    return this.db
  }

  updateAll (db, cb) {
    if (this.getLastUpdate() >= db.lastUpdate) return cb()

    this.db = db
    this.save(cb)
  }

  save (cb) {
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      // emit something to check if saved multiple times?
      return cb(err)
    })
  }

  // Timestamp

  getLastUpdate () {
    return this.db.lastUpdate
  }

  // Sha sum

  getShaSum (data) {
    try {
      const hash = crypto.createHash('sha256')
      hash.update(JSON.stringify(data || this.db.data))
      return hash.digest('hex')
    } catch (error) {
      return null
    }
  }
}

module.exports = Db
