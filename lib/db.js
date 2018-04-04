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
        // If errored, try backup
        data = this.getBackup()
      }
      this.db = data
      return
    } else {
      this.db = this.getBackup()
    }

    this.save(() => {})
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
    this.saveBackup()
    fs.writeFile(this.path, JSON.stringify(this.db), err => {
      // emit something to check if saved multiple times?
      this.saveBackup()
      return cb(err)
    })
  }

  saveBackup () {
    if (fs.existsSync(this.path)) {
      // Copy backup file
      fs.copyFileSync(this.path, this.path + '_backup')
    } else {
      // Create backup file with default data
      fs.writeFileSync(this.path + '_backup', JSON.stringify(this.db))
    }
  }

  getBackup () {
    let data = defaultDb
    if (fs.existsSync(this.path + '_backup')) {
      let backupData = fs.readFileSync(this.path + '_backup')
      try {
        data = JSON.parse(backupData)
      } catch (err) {
        data = defaultDb
      }
    }
    return data
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
