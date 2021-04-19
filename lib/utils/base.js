/* eslint-disable no-console */
import {
  contract,
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
  not
} from 'js-heuristics';

import { EVENT_TYPES } from './const';

const frameDefaults = {
  display: 'none',
  position: 'absolute',
  top: '-999px',
  left: '-999px'
};

const mustBeArray = arg => contract(
  isArray,
  'The provided argument must be an array'
)(arg);

const mustBeBool = arg => contract(
  isBoolean,
  'The provided argument must be a boolean'
)(arg);

const mustBeStrOrNum = arg => {
  if (!isString(arg) && !isNumber(arg)) {
    throw new Error('All of the keyed arguments must be a string or number');
  }
  return true;
};

const mustBeFunc = arg => contract(
  isFunction,
  'The provided argument must be a function'
)(arg);

const hasValidVals = (arg) => {
  if (!isObject(arg)) throw new Error('The provided indexed arguments must be objects')
  const predicate = Object.entries(arg).reduce((acc, [k, v]) => acc = isNumber(v) || isString(v), true);
  if (!predicate) throw new Error('The provided key/value pairs must be strings or numbers');
  return true;
}

const nullify = () => nullify;

function Logger (namespace, verbose) {
  this.namespace = namespace,
  this.verbose = verbose;
  this.log = (event, ...data) => {
    if (
      not(this.verbose) &&
      (data[0]?.result === EVENT_TYPES.ACK) ||
      (data[0]?.type === EVENT_TYPES.SYN)
    ) return;

    console.group(`%c${namespace.toUpperCase()}`, 'color: #ECA440; font-weight: bold');
    console.log(`%c${event.toUpperCase()}`, 'color: #4CAF50; font-weight: bold', ...data);
    console.groupEnd();
  };
}

function retry (fn, max, timeout) {
  function rejectDelay (reason) {
    return new Promise((resolve, reject) => {
      setTimeout(reject.bind(null, reason), timeout);
    });
  }

  let p = Promise.reject();
  for (let i = 0; i <= max; i++) {
    p = p.catch(fn).catch(rejectDelay);
  }

  return p;
}

function purgePromiseJobs () {
  return new Promise(resolve => setImmediate(resolve));
}

export {
  frameDefaults,
  mustBeArray,
  mustBeBool,
  mustBeStrOrNum,
  mustBeFunc,
  nullify,
  Logger,
  retry,
  purgePromiseJobs,
  hasValidVals
};
