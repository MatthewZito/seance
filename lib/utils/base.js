/* eslint-disable no-console */
import {
  contract,
  isArray,
  isBoolean,
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

export {
  frameDefaults,
  mustBeArray,
  mustBeBool,
  nullify,
  Logger
};
