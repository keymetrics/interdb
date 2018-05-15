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
    con1 = new InterDB()
    con2 = new InterDB()
    con3 = new InterDB()
  })

  after(() => {
    con1.stop()
    con2.stop()
    con3.stop()
  })

  after(() => {
    fs.unlinkSync(dbPath1)
    fs.unlinkSync(`${dbPath1}.local`)
    fs.unlinkSync(dbPath2)
    fs.unlinkSync(dbPath3)
  })

  after(() => {
    fs.unlinkSync(`${dbPath1}_backup`)
    fs.unlinkSync(`${dbPath1}.local_backup`)
    fs.unlinkSync(`${dbPath2}_backup`)
    fs.unlinkSync(`${dbPath3}_backup`)
  })

  it('Start InterDB', done => {
    const plan = new Plan(5, done)

    con1.start({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath1,
      localPath: `${dbPath1}.local`,
      identity: 'con1'
    })
    con2.start({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath2,
      identity: 'con2'
    })
    con3.start({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath3,
      identity: 'con3'
    })

    con1.once('ready', () => {
      plan.ok(true)
    })

    con2.once('ready', () => {
      plan.ok(true)
    })

    con3.once('ready', () => {
      plan.ok(true)
    })

    con1.clients.on('peer:connected', () => {
      plan.ok(true)
    })
  })

  describe('Check local DB', () => {
    it('local db exist', () => {
      assert.notEqual(con1.localDb, undefined)
      assert.equal(con2.localDb, undefined)
      assert.equal(con3.localDb, undefined)
    })
  })

  describe('handle broadcast data', () => {
    it('should node1 put data and other node be synced with right data', done => {
      const plan = new Plan(2, done)

      con1.db.put('test', { test: { truc: 'bidule' } }, err => {
        assert.equal(err, null)
      })

      con2.once('refreshed', () => {
        assert.deepEqual(con2.db.get('test'), { test: { truc: 'bidule' } })
        plan.ok(true)
      })

      con3.once('refreshed', () => {
        assert.deepEqual(con3.db.get('test'), { test: { truc: 'bidule' } })
        plan.ok(true)
      })
    }).timeout(4000)

    it('should node1 delete data and other node be synced with right data', done => {
      const plan = new Plan(2, done)

      con1.db.del('test', err => {
        assert.equal(err, null)
      })

      con2.once('refreshed', () => {
        assert.equal(con2.db.get('test'), undefined)
        plan.ok(true)
      })

      con3.once('refreshed', () => {
        assert.equal(con3.db.get('test'), undefined)
        plan.ok(true)
      })
    }).timeout(4000)
  })

  describe('handle disconnection and resyncing', function () {
    it('should disconnect con2', function (done) {
      const plan = new Plan(2, done)

      con1.clients.once('peer:disconnected', function (identity) {
        console.log('con1', identity)
        assert.equal(identity, 'con2')
        plan.ok(true)
      })

      con3.clients.once('peer:disconnected', function (identity) {
        console.log('con3', identity)
        assert.equal(identity, 'con2')
        plan.ok(true)
      })

      con2.stop()
    })

    it('should delete con2 database', function () {
      fs.unlinkSync(dbPath2)
    })

    it('should reconnec con2', function (done) {
      const plan = new Plan(3, done)

      con1.clients.once('peer:connected', identity => {
        console.log('con1', identity)
        assert.equal(identity, 'con2')
        plan.ok(true)
      })

      con3.clients.once('peer:connected', identity => {
        console.log('con3', identity)
        assert.equal(identity, 'con2')
        plan.ok(true)
      })

      con2.once('ready', () => {
        console.log('ready')
        plan.ok(true)
      })

      con2.start({
        namespace: 'test',
        password: 'hardcoded-password',
        path: dbPath2,
        identity: 'con2'
      })
    }).timeout(4000)

    it('should be connected', () => {
      assert.equal(con2.clients.getPeers().length, 2)
      assert.equal(con3.clients.getPeers().length, 2)
    })
  })
})
