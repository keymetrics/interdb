/* eslint-env mocha */
'use strict'

const InterDB = require('..')
const assert = require('assert')

describe.skip('Test discover hub', () => {
  let inter = new InterDB()
  inter.conf = {
    namespace: `mocha_test_${Date.now()}`,
    hub: process.env.INTERDB_HUB
  }

  console.log(`hub: ${inter.conf.hub}`)
  console.log(inter.conf.namespace)

  it('should get 0 peers with hub', done => {
    inter._getAndInjectFromHub((err, hosts) => {
      assert.equal(err, null)
      assert.equal(hosts.length, 0)
      done()
    })
  })

  it('should add 1 host on hub', done => {
    inter._postToHub(err => {
      assert.equal(err, null)
      done()
    })
  })

  it('should get 1 peer with hub', done => {
    inter._getAndInjectFromHub((err, hosts) => {
      assert.equal(err, null)
      assert.equal(hosts.length, 1)
      done()
    })
  })
})
