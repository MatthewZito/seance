import {
  mustBeArray,
  mustBeBool,
  Logger,
  nullify
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

export function Medium (opts = {}) {
  // TODO validate
  return new Observer({
    seanceOrigin: opts.seanceOrigin,
    created: opts.created,
    destroyed: opts.destroyed
  })
    .init();
}
