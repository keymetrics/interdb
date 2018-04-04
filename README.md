# InterDB

InterDB is a shared database with auto discovery.

## Example

```javascript
const interdb = require('interdb')

const con = new interdb()

// Global
con.startLocal('./path.local.db') // Start local db only
con.start({
    namespace: 'business',
    password: 'long-password',
    path: './path.db',
    localPath: './path.local.db', // optional
    identity : {
      // Info that will be shared to other dashboards
    }
}) // join network
con.stop() // exit network

// Bus
con.clients.*
// Refer to Synapsis documentation (https://github.com/Unitech/synapsis)

// local DB
con.localDb.put('key', 'value', cb) // put new data in existing key or create it
con.localDb.push('key', 'value', cb) // push data in existing key if it's an array or create an array with value in first index
con.localDb.del('key', cb) // delete key
con.localDb.get('key') // get value from key
con.localDb.updateAll({ data: {} }, cb) // Overwrite database
con.localDb.getLastUpdate() // Get timestamp of latest action
con.localDb.save(cb) // save changes (use if you modify con.localDb without API)

// Shared DB (all of local API but broadcast changes over network)
con.db.put('key', 'value', cb) // put new data in existing key or create it
con.db.push('key', 'value', cb) // push data in existing key if it's an array or create an array with value in first index
con.db.del('key', cb) // delete key
con.db.get('key') // get value from key
con.db.updateAll({ data: {} }, cb) // Overwrite database
con.db.getLastUpdate() // Get timestamp of latest action
con.db.save(cb) // save changes (use if you modify con.db without API)
```

## Database structure

```json5
{
    lastUpdate: "",
    data: {}
}
```

## Communication structure
### Normal
Host A <-> Host B <-> Host C
 ^----------------------^

### Problem
Host A <-> Host B <-> Host C