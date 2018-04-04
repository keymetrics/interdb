/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')
const Database = require('../lib/db')

describe('Database', () => {
  let db
  const path = './test.db'

  before(() => {
    db = new Database(path)
  })

  after(() => {
    fs.unlinkSync(path)
    fs.unlinkSync(path + '_backup')
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

    it('Push new value in array', done => {
      db.push('foo', 'bar', err => {
        assert.equal(err, null)
        assert.equal(db.get('foo')[0], 'bar')

        db.push('foo', 'baz', err => {
          assert.equal(err, null)
          assert.equal(db.get('foo')[1], 'baz')
          done()
        })
      })
    })
  })

  describe('Timestamp', () => {
    it('Timestamp exists', () => {
      assert.notEqual(db.getLastUpdate(), undefined)
    })
  })
})
