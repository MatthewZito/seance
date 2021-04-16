# Séance | Cross-origin State Sharing

Séance enables cross-domain state sharing via the Browser's local storage.

A Séance can be agreed upon by any number of domains. A `Seance` instance is initialized at the domain you want to serve as the *provider*. Each domain that subscribes to this shared state registers a `Medium`, allowing it to observe the shared state, and perform read / write transactions with it.

`Mediums` use iframes to proxy the `Seance` provider. When initialized, a `Seance` will listen for any `Medium` in its list of registered domains (this can be explicit strings or a group of regular expressions). Once a `Medium` registers itself with the `Seance`, it can begin a `sequence`. A `sequence` is a Promise that when fulfilled provides an API exposing `get`, `set`, `delete`, and `enumerate` operations that read from and write to the shared state.

`Mediums` poll the `Seance` connection in a handshake exchange series of SYN/ACK messages. If at any point the connection is lost, interrupted, or ended, the `sequence` will reject.

## Usage

Initializing a `Seance`:

```js
// at https://domain.com
import { Seance } from 'seance';

Seance(['https://otherdomain.com']);
```

Registering `Mediums`:

```js
// at https://otherdomain.com
import { Medium } from 'seance';

function handleConnErr (ex) { ... }

const medium = Medium({
  // the origin of the `Seance`
  seanceOrigin: 'https://domain.com',
  // callback to invoke when `Medium` is initialized, receives the `Medium`'s uuid
  created: (id) => console.log({ CREATED: id }),
  // callback to invoke when `Medium` is unmounted, receives the `Medium`'s uuid
  destroyed: (id) => console.log({ DESTROYED: id })
});

const keysToSet = [{ key1: 'value1'}, { key2: 'value2' }];

// begin sequence
medium.sequence()
  // connection OK, return api
  .then(api => {
    // set key/val pairs in shared state
    api.set(
      keysToSet,
      // each api method accepts a callback that is invoked when the operation succeeds (or fails)
      function (error, response) {
        if (error) // handle err
        else if (response) // handle response
      });
  })
  .catch(handleConnErr);

const keysToGet = ['key1'];

medium.sequence()
  .then(api => {
    api.get(keysToGet, (error, response) => ...)
  })
  .catch(handleConnErr);

medium.sequence()
  .then(api => {
    api.delete(['key2'], (error, response) => ...);
  })
  .catch(handleConnErr);

```
