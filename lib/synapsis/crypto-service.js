/**
 * Inspired by https://github.com/Mostafa-Samir/klyng/
 */

const crypto = require('crypto');
//const IV = new Buffer(crypto.randomBytes(12)).toString('hex').slice(0, 16);
const IV = 'abcdefghiquejrkt';
const ALGO = 'aes-128-cbc';

/*
 * encrypts a message and signs it with HMAC
 * @param msg {Object}: the message to be secured
 * @param key {String}: the secret key to be used
 * @return {Object}: the secured message
 */
function secure(msg, key) {
  var cipher = crypto.createCipheriv(ALGO, key, IV);
  var hmac = crypto.createHmac('sha256', key);
  var plaintext = (typeof msg === "object") ? JSON.stringify(msg) : msg.toString();

  var ciphertext = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');

  hmac.update(ciphertext);
  var mac = hmac.digest('hex');

  return {payload: ciphertext, mac: mac};
}

/* verifies an encrypted message and decryptes it if verified
 * @param msg {Object}: the encrypted message
 * @param key {String}: the secret key to be used
 * @return {Object|Boolean}: the decrypted message if verified, false otherwise
 */
function verify(msg, key) {
  var hmac = crypto.createHmac('sha256', key);

  hmac.update(msg.payload);
  var mac = hmac.digest('hex');

  if(mac === msg.mac) {
    var decipher = crypto.createDecipheriv(ALGO, key, IV);
    var plaintext = decipher.update(msg.payload, 'hex', 'utf8') + decipher.final('utf8');

    // attempt to parse as json
    try {
      return JSON.parse(plaintext);
    }
    catch(err) {
      // if failed, return plaintext directly
      return plaintext;
    }
  }

  return false;
}

/*
 * returns a wrapper over crypto.DiffieHellman
 * @param prime {String}: a prime number to initialize with (optional)
 * @return {Object}
 */
function diffieHellman(prime) {
  var dhObj = null;
  var wrapper = {};

  if(!!prime)
    dhObj = crypto.createDiffieHellman(prime, 'base64');
  else
    dhObj = crypto.createDiffieHellman(64);

  wrapper.prime = dhObj.getPrime('base64');
  wrapper.publicKey = dhObj.generateKeys('hex');

  wrapper.computeSecret = function(remotePublicKey) {
    return dhObj.computeSecret(remotePublicKey.toString(), 'hex', 'hex');
  };

  return wrapper;
}

module.exports = {
  secure: secure,
  verify: verify,
  diffieHellman: diffieHellman
};
