import {
  EVENT_TYPES,
  QUERY_TYPES,
  TIMERS,
  IDENTIFIERS,
  purgePromiseJobs,
  nullify
 } from '../../lib/utils';

import { Observer } from '../../lib/core';

const seanceOrigin =  'http://mock';

describe('Evaluation of base constructor', () => {
  describe('Default arguments', () => {
    it('defaults the `created` callback to a nullifier', () => {
      const medium = new Observer({
        seanceOrigin
      });

      expect(medium.onCreated).toBe(nullify);
    });

    it('defaults the `destroyed` callback to a nullifier', () => {
      const medium = new Observer({
        seanceOrigin
      });

      expect(medium.onCreated).toBe(nullify);
    });
  });
});
