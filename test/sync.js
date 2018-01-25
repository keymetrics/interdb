/* eslint-env mocha */

const InterDB = require('../')
const assert = require('assert')

describe('Sync', () => {
  let d1, d2
  it('should init first', (done) => {
    d1 = new InterDB({
      namespace: 'pxx-xncs-xs',
      password: 'pxx-xncs-xs' + ' mjhmjuyd6u76u7c65cxu75u64fpowakfpoeam',
      path: './db1'
    })
    d1.start()
    d1.clients.on('ready', done)
  })

  it('should init second', (done) => {
    d2 = new InterDB({
      namespace: 'pxx-xncs-xs',
      password: 'pxx-xncs-xs' + ' mjhmjuyd6u76u7c65cxu75u64fpowakfpoeam',
      path: './db2'
    })
    d2.start()
    d2.clients.on('ready', done)
  })

  it('should be detected', (done) => {
    d2.clients.on('connected', () => {
      done()
    })
  }).timeout(2000)

  it('should set correctly', () => {
    d2.db.push('history', { test: true })
  })

  it('should be saved', () => {
    assert.equal(d2.db.get('history').length, 1)
  })

  it('should be received in less than 1 sec', (done) => {
    setTimeout(() => {
      console.log(d1.db.get('history'))
      assert.equal(d1.db.get('history').length, 1)
      done()
    }, 1000)
  })

  it('should be stopped correctly', () => {
    d1.stop()
    d2.stop()
  })
})
