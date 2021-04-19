import { Observable } from '../../lib/core';

describe('Evaluation of Seance lifecycles', () => {
  describe('Initialization', () => {
    it.todo('binds a message event listener to `recv`');
    it.todo('binds a beforeunload event listener to `onDestroy`');
  });
  describe('Destruction', () => {
    it.todo('purges mediums from observatory map during `onDestroy`');
    it.todo('unbinds event listeners during `beforeDestroy`');
  })
});
