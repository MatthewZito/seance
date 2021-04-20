<script>
import { Medium } from 'seance';

export default {
  name: 'App',
  async mounted () {
    const medium = Medium({
      seanceOrigin: 'http://localhost:8000',
      created: this.onCreate,
      destroyed: this.beforeDestroy
    });
    
    const keysToSet = [{ key1: 'value1'}, { key2: 'value2' }];
    
    medium.sequence()
      .then(api => {
        api.set(keysToSet, function (error, response) {
          if (error) {
            console.log('An error occurred during the set sequence', error);
          } else {
            console.log({ response });
          }
        });
      })
      .catch(this.handleEConn);

    medium.sequence()
      .then(api => {
        api.get(['key1'], console.log)
      })
      .catch(this.handleEConn);

    medium.sequence()
      .then(api => {
        api.delete(['key2'], (error, response) => {
          if (error) console.log('An error occurred, see: ', { error });
          else console.log({ response });
        });
      })
      .catch(this.handleEConn);
      
  },
  methods: {
    handleEConn ({ message }) {
      console.log('A connection error occurred', message);
    },
    onCreate (uuid) {
      console.log(`A new Medium with uuid ${uuid} has been instantiated`);
    },
    beforeDestroy (uuid) {
      console.log(`The Medium with uuid ${uuid} has been destroyed`);
    }
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
