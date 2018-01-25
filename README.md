# InterDB

InterDB is a shared database with auto discovery.

## Example

```javascript
const interdb = require('interdb')

const con = new interdb({
    namespace: 'Salon',
    password: 'hardcoded-password',
    path: './db'
})

// Global
con.start() // connect client
con.stop() // disconnect client
con.reload() // reload discovery

// DB
con.db.put('key', 'value', cb) // put new data in existing key or create it
con.db.push('key', 'value', cb) // push data in existing key if it's an array
con.db.del('key', cb) // delete key
con.db.get('key') // get value from key
con.db.updateAll({ data: {} }, cb) // Overwrite database
con.db.getLastUpdate() // Get timestamp of latest action

// Bus
con.bus.broadcast('event', {}) // broadcast to all connected clients
con.bus.send('hostname/ip', 'event', {}) // send to specific client
con.bus.on('event' (hostname, data) => {}) // use event listener to handle recv

// Clients
con.clients.getAll() // get all connected clients
con.clients.add({ hostname, publicKey })
con.clients.on('connected', (hostname) => {}) // handle clients connection
con.clients.on('disconnected', (hostname) => {}) // handle clients disconnection
```

## Database structure

```json5
{
    lastUpdate: "",
    data: {}
}
```
