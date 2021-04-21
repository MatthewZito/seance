import { isString, not } from 'js-heuristics';

import {
  serialize,
  deserialize,
  EVENT_TYPES,
  QUERY_TYPES,
  IDENTIFIERS
} from '../utils';

/**
 * @description Initializer for an `Observable` - a server instance for managing shared state with a given Observer or allotment thereof
 * in a bidirectional, centralized network
 * @param {array} origins An array of the hostnames for existing Observers awaiting network incorporation
 */
class Observable {
  constructor (origins, logger) {
    // pool of pending observers
    this.pool = origins;
    // map of incorporated observers
    this.observatory = new Map();
    this.logger = logger;
  }

  /**
   * @summary Initialize prime observable instance
   * Binds `message` and `beforeunload` event listeners, incorporates pre-extant observers
   */
  init () {
    // bind message listener
    window.addEventListener(
      'message',
      this.recv.bind(this)
    );

    window.addEventListener(
      'beforeunload',
      this.beforeDestroy.bind(this)
    );
  }

  /**
   * @summary Incorporate a new observer and render it eligible for communications
   * @param {string} origin
   * @param {number} id
   */
  incorporate (origin, id) {
    const prospect = this.pool.find(observer => observer === origin);
    // observer for given id exists, abort
    if (!prospect || this.observatory.has(origin)) {
      return;
    }

    this.observatory.set(origin, { origin });

    const url = (window.location != window.parent.location)
      ? document.referrer
      : document.location.href;

    // if we're in the runtime env of the parent observable, and not the proxy, abort
    if (url !== origin) return;

    this.emit({
      id,
      error: null,
      result: EVENT_TYPES.ACK
    }, origin);
  }

  /**
   * @summary Eject observer and un-incorporate, if extant
   * @param {string} origin
   * @param {number} id
   */
  eject (origin) {
    if (this.observatory.has(origin)) {
      this.observatory.delete(origin);
    }
  }

  /**
   * @summary Primary event callback; dispatches requested actions
   * @param {(string|any)} message If valid, a serialized message received via `postMessage`
   */
  recv (message) {
    const { origin, data } = message;

    if (not(origin) || not(data)) return;

    if (not(isString(data))) return;

    const deserialized = deserialize(data);
    const { id, type, payload } = deserialized;

    // this is not a request from a known client; return
    if ((this.pool.findIndex(_ => _ === origin) < 0)) return; // TODO permissions

    if (not(id) || not(type) || not(payload)) return;

    this.logger('recv', { senderOrigin: origin, ...deserialized });

    switch(true) {
      case type === EVENT_TYPES.MOUNT:
        this.incorporate(origin, id);
        break;
      case type === EVENT_TYPES.UNMOUNT:
        this.eject(origin, id);
        break;
      case type === EVENT_TYPES.SYN:
        this.emit({
          id,
          error: null,
          result: EVENT_TYPES.ACK
        }, origin);
        break;
      // action is a match; invoke it
      case Object.keys(QUERY_TYPES).includes(type):
        this.processAction(deserialized, origin);
        break;
      default:
        break;
    }
  }

  /**
   * @summary Invoked prior to `beforeunload` event resolution;
   * messages all observers indicating conn close, subsequently unregisters events
   */
  beforeDestroy () {
    /* eslint-disable-next-line no-unused-vars */
    for (const [ _, { origin } ] of this.observatory.entries()) {
      this.emit({
        id: IDENTIFIERS.DESTROY_ID,
        error: null,
        result: EVENT_TYPES.CLOSE
      }, origin);

    }

    window.removeEventListener(
      'message',
      this.recv.bind(this)
    );

    window.removeEventListener(
      'beforeunload',
      this.beforeDestroy.bind(this)
    );
  }

  /**
   * @summary Send a message to the specified observer
   * @param {object} payload
   * @param {string} origin
   */
  emit ({ id, error, result }, origin) {
    this.logger('send', { receiverOrigin: origin, id, error, result });

    window.parent.postMessage(
      serialize({
        id,
        error,
        result
      }),
      origin
    );
  }

  /**
   * @summary Process valid action types requested by a given observer
   * @param {number} object.id
   * @param {string} object.type
   * @param {string} object.origin
   * @param {object} object.payload
   */
  processAction ({ id, type, payload }, origin) {
    let result = null,
      error = null;

    const action = type.toLowerCase();

    try {
      result = this[action](payload);
    } catch (ex) {
      error = ex.message;
    }

    this.emit({ id, error, result }, origin);
  }

  /**
   * @summary Retrieve an item or items from the storage adapter
   * @param {array} payload
   * @returns {array} An array of objects, denoting the result of each operation
   */
  get (payload) {
    const result = [];
    // TODO return null, err for key not extant
    for (const key of payload) {
      try {
        const item = localStorage.getItem(key);
        result.push({ [key]: item });
      } catch (ex) {
        result.push({ [key]: false });
      }
    }

    return result;
  }

  /**
   * @summary Set an item or items from the storage adapter
   * @param {array} payload
   * @returns {array} An array of objects, denoting the result of each operation
   */
  set (payload) {
    const result = [];

    for (const pair of payload) {
      const [key, value] = Object.entries(pair)[0];
      try {
        localStorage.setItem(key, value);
        result.push({ [key]: true });
      } catch (ex) {
        result.push({ [key]: false });
      }
    }

    return result;
  }

  /**
   * @summary Delete an item or items from the storage adapter
   * @param {array} payload
   * @returns {array} An array of objects, denoting the corresponding result of each operation
   */
  delete (payload) {
    const result = [];
    // TODO return null for non-existent key
    for (const key of payload) {
      try {
        localStorage.removeItem(key);
        result.push({ [key]: true });
      } catch (ex) {
        result.push({ [key]: false });
      }
    }

    return result;
  }
}

export {
  Observable
};
