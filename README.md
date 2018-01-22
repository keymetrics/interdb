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
con.db.put('key', {}) // put new data in existing key or create it
con.db.del('key') // delete key
con.db.find(/all/g) // find value
con.db.merge('key', {}) // merge values

// Bus
con.bus.broadcast('event', {}) // broadcast to all connected clients
con.bus.send('hostname/ip', 'event', {}) // send to specific client
con.bus.on('event' (hostname, data) => {}) // use event listener to handle recv

// Clients
con.clients.getAll() // get all connected clients
con.clients.add({ hostname, publicKey })
con.clients.on('connect', (hostname) => {}) // handle clients connection
con.clients.on('disconnect', (hostname) => {}) // handle clients disconnection
```

## Database structure

```json5
{
    lastUpdate: "",
    data: {}
}
```
