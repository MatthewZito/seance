<script>
import { initObserver } from '@kibbutz';

export default {
  name: 'App',
  async mounted () {
    const observer = initObserver({
      parentOrigin: 'http://localhost:8000',
      created: (id) => console.log({ CREATED: id }),
      destroyed: (id) => console.log({ DESTROYED: id })
    });
    
    observer.sequence()
      .then(api => {
        api.set([{ key1: 'value1'}, { key2: 'value2' }], console.log);
      })
        .catch(() => console.log('ECONN:ERR'));

    observer.sequence()
      .then(api => {
        api.get(['key1'], (error, response) => console.log({error}, 'RES: ', {response}))
      })
        .catch(() => console.log('ECONN:ERR'));

    observer.sequence()
      .then(api => {
        api.delete(['key2'], (error, response) => {
          if (error) console.log('An error occurred, see: ', {error});
          else console.log({ response });
        });
      })
        .catch(() => console.log('ECONN:ERR'));
      
  }
};
</script>

<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
