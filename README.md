# InterDB

InterDB is a shared database with auto discovery.

## Example

```javascript
const interdb = require('interdb')

const con = new interdb({
    namespace: 'business',
    password: 'long-password',
    path: './path.db',
    identity : {
      // Info that will be shared to other dashboards
    }
})

// Global
con.start() // join network
con.stop() // exit network

// Bus
con.clients.*
// Refer to Synapsis documentation (https://github.com/Unitech/synapsis)

// DB
con.db.put('key', 'value', cb) // put new data in existing key or create it
con.db.push('key', 'value', cb) // push data in existing key if it's an array or create an array with value in first index
con.db.del('key', cb) // delete key
con.db.get('key') // get value from key
con.db.updateAll({ data: {} }, cb) // Overwrite database
con.db.getLastUpdate() // Get timestamp of latest action


```

## Database structure

```json5
{
    lastUpdate: "",
    data: {}
}
```
