import {
  mustBeArray,
  mustBeBool,
  Logger,
  nullify,
  mustBeFunc,
  mustBeStr
} from './utils';

import { Observable, Observer } from './core';

export function Seance (origins = [], { logger = false, verbose = false } = {}) {
  mustBeArray(origins);
  mustBeBool(logger);
  mustBeBool(verbose);

  return new Observable(
    origins,
    logger ? new Logger('Observable', verbose).log : nullify
  )
    .init();
}

export function Medium ({ seanceOrigin, created = nullify, destroyed = nullify } = {}) {
  mustBeFunc(created);
  mustBeFunc(destroyed);
  mustBeStr(seanceOrigin);

  return new Observer({
    seanceOrigin,
    created,
    destroyed
  })
    .init();
}
