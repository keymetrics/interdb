/* eslint-env mocha */
'use strict'

const assert = require('assert')
const fs = require('fs')

const InterDB = require('..')

describe('Backup', () => {
  let con
  const dbPath = './database1'

  before(() => {
    try {
      fs.unlinkSync(dbPath)
    } catch (e) {}
    try {
      fs.unlinkSync(dbPath + '_backup')
    } catch (e) {}

    con = new InterDB()
  })

  after(() => {
    try {
      fs.unlinkSync(dbPath)
    } catch (e) {}
    try {
      fs.unlinkSync(dbPath + '_backup')
    } catch (e) {}
  })

  it('should try to get default data', () => {
    con.startLocal(dbPath)
    assert.deepEqual(con.localDb.db.data, {})
  })

  it('should have created backup', () => {
    assert.equal(fs.existsSync(dbPath + '_backup'), true)
  })

  it('should put data', (done) => {
    con.localDb.put('test', true, done)
  })

  it('should corrupt database', () => {
    fs.writeFileSync(dbPath, '')
  })

  it('should start with backup', () => {
    con.startLocal(dbPath)
    assert.deepEqual(con.localDb.db.data, { test: true })
  })

  it('should corrupt database again', () => {
    fs.unlinkSync(dbPath)
  })

  it('should start with backup again', () => {
    con.startLocal(dbPath)
    assert.deepEqual(con.localDb.db.data, { test: true })
  })
})
