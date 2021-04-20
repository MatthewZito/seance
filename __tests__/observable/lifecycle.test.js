import { EVENT_TYPES, IDENTIFIERS, nullify } from '../../lib/utils';
import { Observable } from '../../lib/core';

const origins = ['http://localhost:8001'];

describe('Evaluation of Seance lifecycles', () => {
  describe('Initialization', () => {
    const mock = jest.spyOn(window, 'addEventListener');
    const seance = new Observable(origins);

    it('binds a message event listener to `recv`', () => {
      seance.init();

      expect(mock).toHaveBeenCalled();
      expect(mock).toHaveBeenCalledTimes(2);

      expect(mock.mock.calls[0][0]).toBe('message');
      expect(Object.create(seance.recv.prototype) instanceof mock.mock.calls[0][1]);

    });

    it('binds a beforeunload event listener to `beforeDestroy`', () => {
      seance.init();

      expect(mock).toHaveBeenCalled();
      expect(mock).toHaveBeenCalledTimes(2);

      expect(mock.mock.calls[1][0]).toBe('beforeunload');
      expect(Object.create(seance.beforeDestroy.prototype) instanceof mock.mock.calls[0][1]);
    });
  });

  describe('Destruction', () => {
    const seance = new Observable(origins);
    seance.logger = nullify;

    it('sends DESTROY/CLOSE signal to all mediums from observatory map during `beforeDestroy`', () => {
      const model = _ => [_, { origin: origins[0] + _ }];

      ['a', 'b', 'c'].forEach(_ => seance.observatory.set( model(_)[0], model(_)[1] ));

      const observedEmit = jest.spyOn(seance, 'emit');

      const o = {
        id: IDENTIFIERS.DESTROY_ID,
        error: null,
        result: EVENT_TYPES.CLOSE
      };

      seance.init();

      expect(observedEmit).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('beforeunload'));

      expect(observedEmit).toHaveBeenCalled();
      expect(observedEmit).toHaveBeenCalledTimes(3);

      ['a', 'b', 'c'].forEach((_, idx) => {
        expect(observedEmit.mock.calls[idx]).toMatchObject([o, origins[0] + _]);
      });
    });


    it('unbinds event listeners during `beforeDestroy`', () => {
      const mock = jest.spyOn(window, 'removeEventListener');
      const seance = new Observable(origins)

      seance.init();

      expect(mock).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('beforeunload'));

      expect(mock).toHaveBeenCalled();

      expect(mock.mock.calls[0][0]).toBe('message');
      expect(Object.create(seance.recv.prototype) instanceof mock.mock.calls[0][1]);

      expect(mock.mock.calls[1][0]).toBe('beforeunload');
      expect(Object.create(seance.beforeDestroy.prototype) instanceof mock.mock.calls[0][1]);
    });
  });
});
