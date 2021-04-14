// function resolveLocalStorage () {
//   if (!window?.localStorage) return false;

//   return window.localStorage;
// }

// const localStorageProxy = new Proxy(localStorage, {
//   get (target, name, recv) {
//     const value = Reflect.get(target, name, recv);

//     return typeof value === 'function'
//       ? value.bind(target)
//       : value;
//   },
//   set  (target, name, value, recv) {
//     if (!['setItem', 'getItem', 'removeItem'].includes(name)) {
//      console.log(value);
//      console.trace();
//     }
//     if (name === 'setItem') {
//       return false;
//     }
//     // probably an error here too
//     return Reflect.set(target, name, value, recv);
//   },
// });
