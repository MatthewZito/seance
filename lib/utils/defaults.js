import { contract, isArray } from 'js-heuristics';

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

export {
  frameDefaults,
  mustBeArray
};
