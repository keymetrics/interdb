/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')
const InterDB = require('..')
const Plan = require('./plan')

describe('InterDB', () => {
  let con1
  let con2
  let con3
  const dbPath1 = './database1'
  const dbPath2 = './database2'
  const dbPath3 = './database3'

  before(() => {
    con1 = new InterDB({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath1,
      identity: {
        hostname: 'con1'
      }
    })

    con2 = new InterDB({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath2,
      identity: {
        hostname: 'con2'
      }
    })

    // con3 = new InterDB({
    //   namespace: 'test',
    //   password: 'hardcoded-password',
    //   path: dbPath3,
    //   identity: {
    //     hostname: 'con3'
    //   }
    // })
  })

  after(() => {
    fs.unlinkSync(dbPath1)
    fs.unlinkSync(dbPath2)
    // fs.unlinkSync(dbPath3)
  })

  it('Start con1', done => {
    con1.start()

    con1.once('ready', () => {
      con1.db.put('key', 'value', err => {
        assert.equal(err, null)
        assert.equal(con1.db.get('key'), 'value')
        done()
      })
    })
  })

  it('con2 sync it database with con1', done => {
    con2.start()

    con2.once('ready', () => {
      assert.equal(con2.db.get('key'), 'value')
      done()
    })
  })
})
