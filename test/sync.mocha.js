/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')
const InterDB = require('..')
const Plan = require('./plan')

describe('Sync', () => {
  let con1
  let con2
  let con3
  const dbPath1 = './database1'
  const dbPath2 = './database2'
  const dbPath3 = './database3'

  before(() => {
    try {
      fs.unlinkSync(dbPath1)
      fs.unlinkSync(dbPath2)
      fs.unlinkSync(dbPath3)
    } catch(e) {}

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

    con3 = new InterDB({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath3,
      identity: {
        hostname: 'con3'
      }
    })
  })

  after(() => {
    con1.stop()
    con2.stop()
    con3.stop()
    fs.unlinkSync(dbPath1)
    fs.unlinkSync(dbPath2)
    fs.unlinkSync(dbPath3)
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
      con2.once('synced', () => {
        assert.equal(con2.db.get('key'), 'value')
        done()
      })
    })
  })

  it('con2 put data and con1 sync data', done => {
    con2.db.put('test', true, err => {
      assert.equal(err, null)
      con1.once('refreshed', () => {
        assert.equal(con1.db.get('test'), true)
        done()
      })
    })
  })

  it('con3 sync it database', done => {
    const plan = new Plan(3, done)
    con3.start()

    con3.once('ready', () => {
      con3.once('synced', () => {
        assert.equal(con3.db.get('key'), 'value')
        assert.equal(con3.db.get('test'), true)
        plan.ok(true)
      })
    })

    con3.clients.on('peer:connected', (identity, socket) => {
      plan.ok(true)
    })
  })

  it('con3 put data and con1 and con2 sync data', done => {
    const plan = new Plan(2, done)

    con3.db.put('count', 2, err => {
      assert.equal(err, null)

      con1.once('refreshed', () => {
        console.log('REFRESHED CON 1')
        assert.equal(con1.db.get('count'), 2)
        plan.ok(true)
      })
      con2.once('refreshed', () => {
        console.log('REFRESHED CON 2')
        assert.equal(con2.db.get('count'), 2)
        plan.ok(true)
      })
    })
  })
})
