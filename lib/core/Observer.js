import {
  isString,
  notNullOrUndefined,
  not,
  isFunction
} from 'js-heuristics';

import {
  generateID,
  generateUUID,
  serialize,
  deserialize,
  frameDefaults,
  mustBeArray,
  EVENT_TYPES,
  QUERY_TYPES,
  TIMERS,
  IDENTIFIERS,
  nullify,
  retry,
  mustBeStrOrNum,
  mustBeFunc,
  hasValidVals
} from '../utils';

/**
 * @description Initializer for an `Observer` - a client instance for managing shared state with a given Observable
 * in a bidirectional, centralized network
 * @param {string} seanceOrigin The full hostname for the Observable origin to which the Observer will connect
 * @param {function} created A callback to be invoked when the Observer has been initialized; receives the Observer's UUID as an argument
 * @param {function} destroyed A callback to be invoked when the Observer has been ejected; receives the Observer's UUID as an argument
 */
class Observer {
  /* istanbul ignore next */
  constructor ({
    seanceOrigin,
    created,
    destroyed
  } = {}) {
    this.messageId = generateID();
    this.uuid = generateUUID();
    this.seanceOrigin = seanceOrigin;
    this.proxyEl = null;
    this.onCreated = created || nullify;
    this.onDestroyed = destroyed || nullify;
    this.responses = new Map();
    this.preflight = null;
    this.onAcknowledge = function () {
      this.preflight = TIMERS.CONN_FULFILLED;
    };
  }

  /**
   * @summary Initialize the observer instance;
   * creates a new iframe DOM node as a proxy for communicating with the observable
   */
  init () {
    this.renderFrame();
    this.poll();

    window.addEventListener(
      'message',
      this.recv.bind(this)
    );

    window.addEventListener(
      'load',
      this.mount.bind(this)
    );

    window.addEventListener(
      'beforeunload',
      this.unMount.bind(this)
    );

    // from base instance, expose initializer `sequence`
    return this;
  }

  /**
   * @summary Open a proxy to the Observable instance by appending its origin as an iframe on the Observer's document
   */
  renderFrame () {
    const frame = window.document.createElement('iframe');

    // map base frame styles to set display to 'none' and other such obfuscators
    for (const [key, value] of Object.entries(frameDefaults)) {
      frame.style[key] = value;
    }

    window.document.body.appendChild(frame);

    frame.src = this.seanceOrigin;
    frame.id = this.uuid;

    this.proxyEl = frame;
  }

  /**
   * @summary Callback invoked on-mount; emits a `mount` type event, prompting the Observable to incorporate
   * the calling Observer into its known origins mapping
   */
  mount () {
    this.emit(
      EVENT_TYPES.MOUNT,
      this.uuid,
      /* istanbul ignore next */
      x => x
    );

    this.create();
  }

   /**
   * @summary Callback invoked on-unmount; emits an `unmount` type event, prompting the Observable to eject
   * the calling Observer and remove from known origins mapping
   */
  unMount () {
    this.emit(
      EVENT_TYPES.UNMOUNT,
      this.uuid,
      /* istanbul ignore next */
      x => x
    );

    this.destroy();
  }

  /**
   * @summary Callback invoked once the Observer has been initialized and the load event listener bound;
   * further invokes the provided onCreated callback, or a noop if one was not provided
   */
  create () {
    this.onCreated(
      this.uuid
    );
  }

   /**
   * @summary Callback invoked right before the Observer has unloaded;
   * further invokes the provided onDestroyed callback, or a noop if one was not provided
   */
  destroy () {
    this.onDestroyed(
      this.uuid
      // TODO return state
    );

    // cleanup; remove the iframe node
    this.proxyEl.parentNode.removeChild(this.proxyEl);

    window.removeEventListener(
      'message',
      this.recv.bind(this)
    );

    window.removeEventListener(
      'load',
      this.mount.bind(this)
    );

    window.removeEventListener(
      'beforeunload',
      this.unMount.bind(this)
    );
  }

  /**
   * @summary Polling executor; polls the Observable at *n* ms interval, propagating ACK callback invocations;
   * these invocations result in the toggling of the preflight flag
   */
  poll () {
    setInterval(() => {
      this.emit(
        EVENT_TYPES.SYN,
        this.uuid,
        this.onAcknowledge.bind(this)
      );

    }, TIMERS.CONN_INTERVAL);
  }

  /**
   * @summary Invoked on-message; processes inbound messages from the Observable and their respective payloads;
   * enforces CORS restrictions
   * @param {(string|any)} message If valid, a serialized message received via `postMessage`
   */
  recv (message) {
    if (message.origin !== this.seanceOrigin || not(isString(message.data))) return;

    const { id, error, result } = deserialize(message.data);

    if (
      not(notNullOrUndefined(id)) ||
      (not(notNullOrUndefined(result)) && not(notNullOrUndefined(error)))
    ) return;

    /* anticipated messages w/out ids */

    // observable `unload` fired
    if (id === IDENTIFIERS.DESTROY_ID && result === EVENT_TYPES.CLOSE) {
      this.preflight = null;
      return;
    }

    /* anticipated messages with corresponding ids */

    if (!this.responses.has(id)) return;

    // recv poll response
    if (result === EVENT_TYPES.ACK) {
      this.preflight = TIMERS.CONN_FULFILLED;
    } else {
      const cb = this.responses.get(id);
      if (isFunction(cb)) (error, result);
    }

    this.responses.delete(id);
  }

  /**
   * @summary Send a message to the Observable
   * @param {string} type
   * @param {object} payload
   * @param {function} cb A callback to be invoked upon receipt of the message's corresponding response
   */
  emit (type, payload, cb) {
    // generate an id; the corresponding response from the Observable will utilize this
    const id = this.messageId.next().value;

    this.proxyEl.contentWindow.postMessage(
      serialize({
        sender: this.uuid,
        id,
        type,
        payload
      }), this.seanceOrigin);

    this.responses.set(id, cb);
  }

  /* Public Interface */

  /**
   * @summary Resolves on confirmed connections to the Observable (and in kind rejects on unfulfilled connections);
   * initialize a sequence of shared state changes
   * @returns {Promise} A promise that resolves to the Observer's public interface
   */

  sequence () {
    const resolver = () => {
      /* istanbul ignore else */
      if (this.preflight === TIMERS.CONN_FULFILLED) return { ...this.publicApi() };
      throw new Error(`Observable storage instance at ${this.seanceOrigin} cannot be reached`);
    };

    return retry(resolver, TIMERS.MAX_CONN_ATTEMPTS, TIMERS.CONN_INTERVAL);
  }

  /**
   * @summary Retrieve an item or items from the storage adapter
   * @param {array} keys An array of keys, each denoting the storage keys for which to retrieve values
   * @param {function} cb A callback to be invoked upon receipt of the message's corresponding response
   * @returns {object} The Observer's public interface
   */
  get (keys, cb) {
    // guards
    mustBeArray(keys);
    if (notNullOrUndefined(cb)) mustBeFunc(cb);
    keys.forEach(mustBeStrOrNum);

    // iface
    this.emit(
      QUERY_TYPES.GET,
      keys,
      cb
    );

    return this.publicApi();
  }

   /**
   * @summary Set an item or items in the storage adapter
   * @param {array} pairs An array of objects, each denoting the storage values and keys to which they will be set
   * @param {function} cb A callback to be invoked upon receipt of the message's corresponding response
   * @returns {object} The Observer's public interface
   */
  set (pairs, cb) {
    // guards
    mustBeArray(pairs);
    if (notNullOrUndefined(cb)) mustBeFunc(cb);
    pairs.forEach(hasValidVals);

    // iface
    this.emit(
      QUERY_TYPES.SET,
      pairs,
      cb
    );

    return this.publicApi();
  }

  /**
   * @summary Delete an item or items from the storage adapter
   * @param {array} keys An array of keys, each denoting the storage keys for which to delete values
   * @param {function} cb A callback to be invoked upon receipt of the message's corresponding response
   * @returns {object} The Observer's public interface
   */
  delete (keys, cb) {
    // guards
    mustBeArray(keys);
    if (notNullOrUndefined(cb)) mustBeFunc(cb);

    // iface
    this.emit(
      QUERY_TYPES.DELETE,
      keys,
      cb
    );

    return this.publicApi();
  }

  publicApi () {
    return {
      get: this.get.bind(this),
      set: this.set.bind(this),
      delete: this.delete.bind(this)
    };
  }
}

export {
  Observer
};
