/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')
const Database = require('../lib/db')

describe('Database', () => {
  let db
  const dbPath = './test.db'

  before(() => {
    db = new Database(dbPath)
  })

  after(() => {
    fs.unlinkSync(dbPath)
  })

  describe('Data', () => {
    it('Get unset value', () => {
      assert.equal(db.get('foo'), undefined)
    })

    it('Put value in key', done => {
      db.put('foo', 'bar', err => {
        assert.equal(err, null)
        assert.equal(db.get('foo'), 'bar')
        done()
      })
    })

    it('Delete key', done => {
      db.del('foo', err => {
        assert.equal(err, null)
        assert.equal(db.get('foo'), undefined)
        done()
      })
    })
  })

  describe('Timestamp', () => {
    it('Timestamp exists', () => {
      assert.notEqual(db.getLastUpdate(), undefined)
    })
  })
})
