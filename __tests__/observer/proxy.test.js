import { Observer } from '../../lib/core';

const seanceOrigin = 'http://mock';

import { frameDefaults, nullify } from '../../lib/utils';

describe('Evaluation of Seance proxying', () => {
  const params = {
    seanceOrigin,
    created: nullify,
    destroyed: nullify
  };

  const medium = new Observer(params).init();

  const frame = document.getElementById(medium.uuid);

  describe('Rendering of iframe proxy', () => {

    it('creates an invisible iframe to proxy the Seance', () => {
      expect(frame).not.toBeVisible();
    });

    it('persists the iframe in a `proxyEl` member', () => {
      expect(frame).toBe(medium.proxyEl);
    });

    it('sets the `frameDefaults` attrs to the iframe', () => {
      for (const [key, value] of Object.entries(frameDefaults)) {
        expect(frame).toHaveStyle(`${key}:${value}`);
      }
    });
  });

  describe('Meta-attributes of iframe proxy', () => {
    it('has a source set to that of the Seance origin', () => {
      // JSDOM bug add '/'
      expect(frame.src).toBe(medium.seanceOrigin + '/');
    });

    it('has an id to that of the Medium uuid', () => {
      expect(frame.id).toBe(medium.uuid);
    });
  });

  describe('DOM state', () => {
    it('appends the iframe as a child of the document body', () => {
      expect(document.body.children.length).toBe(1);
      expect(document.body.children[0]).toEqual(frame);
    });
  });
});
