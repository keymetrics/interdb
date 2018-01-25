/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')
const InterDB = require('../lib/interdb')
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
      path: dbPath1
    })
    con2 = new InterDB({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath2
    })
    con3 = new InterDB({
      namespace: 'test',
      password: 'hardcoded-password',
      path: dbPath3
    })
  })

  after(() => {
    fs.unlinkSync(dbPath1)
    fs.unlinkSync(dbPath2)
    fs.unlinkSync(dbPath3)
  })

  describe('Start interdb', () => {
    it('Start InterDB', done => {
      const plan = new Plan(5, done)

      con1.start()
      con2.start()
      con3.start()

      con1.clients.on('ready', () => {
        plan.ok(true)
      })

      con2.clients.on('ready', () => {
        plan.ok(true)
      })

      con3.clients.on('ready', () => {
        plan.ok(true)
      })

      con1.clients.on('peer:connected', () => {
        plan.ok(true)
      });
    })

    it('Broadcast to clients', done => {

      con1.db.put('test', true, err => {
        assert.equal(err, null)

        con2.on('db:refreshed', () => {
          console.log(con2.db.get('test'))
          done()
        });
      })
    })
  })
})
