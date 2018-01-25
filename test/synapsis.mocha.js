
var Synapsis = require('../lib/synapsis/synapsis.js');
var Plan = require('./plan.js');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

function mountRoutes(router) {
  // Without callback
  router.on('ping', function(data) {
    emitter.emit('ping', data);
  });

  // With callback
  router.on('getInfo', function(data, cb) {
    return cb(null, data);
  });
}

describe('Synapsis', function() {
  this.timeout(6000);
  var p1, p2, p3;

  after(function() {
    p1.stop();
    p2.stop();
  });

  it('should instanciate first peer', function(done) {
    p1 = new Synapsis({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard1'
      }
    });

    p1.start();

    p1.router('ping', function(data) {
      emitter.emit('ping', data);
    });

    p1.router('getInfo', function(data, reply) {
      return reply(null, data);
    });

    p1.once('ready', done);
  });

  it('should instanciate second peer and detect', function(done) {
    p2 = new Synapsis({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard2'
      },
      routes: mountRoutes
    });

    p2.start();

    p2.once('peer:connected', function() {
      done();
    });
  });

  it('should instanciate a unauthorized peer and not be accepted by others', function(done) {
    p3 = new Synapsis({
      namespace : 'test',
      password : 'WRONG-PASSWORD',
      identity : {
        name : 'dashboard3'
      },
      routes: mountRoutes
    });

    p3.start();

    p1.once('rejected', function() {
      p3.stop();
      done();
    });
  });


  it('should p3 now get authorized', function(done) {
    var plan = new Plan(3, done);

    p3 = new Synapsis({
      namespace : 'test',
      password : '123456',
      identity : {
        name : 'dashboard3'
      },
      routes: mountRoutes
    });

    p1.once('peer:connected', function(identity) {
      assert.equal(identity.name, 'dashboard3');
      plan.ok(true);
    });

    p2.once('peer:connected', function(identity) {
      assert.equal(identity.name, 'dashboard3');
      plan.ok(true);
    });

    p3.once('peer:connected', function() {
      plan.ok(true);
    });

    p3.start();
  });


  it('should p1 broadcast to p2 and p3', function(done) {
    var plan = new Plan(2, done);

    p1.broadcast('ping');

    // hack to verify that peers received a message
    emitter.on('ping', function(data) {
      plan.ok(true);
    });
  });

  it('should p1 broadcast to p2 and p3', function(done) {
    var plan = new Plan(2, done);

    p2.broadcast('getInfo', { data : true }, function(err, data) {
      plan.ok(true);
    });
  });

  it('should get socket list', function() {
    assert.equal(p1.getPeers().length, 2);
  });

  it('should send getInfo to only one peer', function(done) {
    var id = p1.getPeers()[0].id;

    p1.send(id, 'getInfo', {data : true}, function(err, data) {
      done();
    });
  });

  it('should catch disconnect event when peer leaves', function(done) {
    p1.once('peer:disconnected', function(peer) {
      assert.equal(peer.name, 'dashboard3');
      done()
    });

    p3.stop();
  });

  it('should send lot of data and check that everything is good', function(done) {
    var length = 999999;
    var buffer = Buffer(length).fill('A');

    p1.broadcast('getInfo', { db : buffer }, function(err, data) {
      done();
    });
  });

});
