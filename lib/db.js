'use strict'

const crypto = require('crypto')
const fs = require('fs')

class Db {
  constructor (path) {
    this.path = path || './database'

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
      lastUpdate: 0,
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
      return cb(err)
    })
  }

  del (key, cb) {
    delete this.db.data[key]
    this.db.lastUpdate = Date.now()
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      return cb(err)
    })
  }

  push (key, value, cb) {
    if (this.db.data[key] && !Array.isArray(this.db.data[key])) {
      return cb(new Error(`${key} is not an array`))
    }

    if (!this.db.data[key]) this.db.data[key] = []

    this.db.lastUpdate = Date.now()
    this.db.data[key].push(value)
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      return cb(err)
    })
  }

  getDatabase () {
    return this.db
  }

  updateAll (db, cb) {
    if (this.getLastUpdate() >= db.lastUpdate) return cb()

    this.db = db
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
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
