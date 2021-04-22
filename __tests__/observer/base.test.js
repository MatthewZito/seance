import {
  nullify
 } from '../../lib/utils';

describe('Evaluation of base constructor', () => {
  describe('Default arguments', () => {
    it('defaults the `created` callback to a nullifier', () => {
      const medium = makeMedium();

      expect(medium.onCreated).toBe(nullify);
    });

    it('defaults the `destroyed` callback to a nullifier', () => {
      const medium = makeMedium();

      expect(medium.onCreated).toBe(nullify);
    });
  });
});
