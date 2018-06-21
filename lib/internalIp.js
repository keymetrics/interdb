const os = require('os')

const type = {
  v4: {
    def: '127.0.0.1',
    family: 'IPv4'
  },
  v6: {
    def: '::1',
    family: 'IPv6'
  }
}

function internalIp (version) {
  const options = type[version]
  let ret = options.def
  const interfaces = os.networkInterfaces()

  Object.keys(interfaces).forEach(el => {
    if (el === 'lo' || el.match(/^ap/g) !== null) return
    if (process.env.NODE_ENV !== 'production' && (el.match(/^veth/g) !== null || el.match(/^docker/g) !== null || el.match(/^br-/g) !== null || el.match(/^tun/g) !== null)) return

    interfaces[el].forEach(function (el2) {
      if (!el2.internal && el2.family === options.family) {
        ret = el2.address
      }
    })
  })

  return ret
}

function v4 () {
  return internalIp('v4')
}

function v6 () {
  return internalIp('v6')
}

module.exports = v4
module.exports.v4 = v4
module.exports.v6 = v6
