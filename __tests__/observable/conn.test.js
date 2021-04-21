import { EVENT_TYPES, generateUUID, nullify, QUERY_TYPES } from '../../lib/utils';
import { Observable } from '../../lib/core';

const origins = ['http://localhost:8001', 'http://localhost:8002'];

describe('Evaluation of medium intake', () => {
  describe('incorporate', () => {
    it('returns if either the pool does not or observatory does contain the received origin', () => {
      const seance = new Observable(origins);
      seance.logger = nullify;

      const mock = jest.spyOn(seance, 'logger');

      seance.init();

      expect(mock).not.toHaveBeenCalled();

      window.dispatchEvent(message({
        origin: 'null',
        data: payload({ payload: generateUUID() })
      }));

      expect(mock).not.toHaveBeenCalled();
    });

    it('sets the pool prospect in the observatory map, if valid', () => {
      const seance = new Observable(origins);
      seance.logger = nullify;

      const mock = jest.spyOn(seance, 'logger');

      seance.init();

      expect(mock).not.toHaveBeenCalled();

      expect(seance.observatory.size).toBe(0);
      expect(seance.pool.includes(origins[0])).toBe(true);

      window.dispatchEvent(message({
        data: payload({ payload: generateUUID() })
      }));

      expect(mock).toHaveBeenCalled();

      expect(seance.observatory.size).toBe(1);
    });

    it('returns if the parent url is not equal to the medium\'s', () => {
      const seance = new Observable(origins);
      seance.logger = nullify;

      const observedEmit = jest.spyOn(seance, 'emit');

      seance.init();

      window.dispatchEvent(message({
        data: payload({ payload: generateUUID() })
      }));

      expect(seance.observatory.size).toBe(1);

      expect(observedEmit).not.toHaveBeenCalled();
    });
  });

  describe('eject', () => {
    it('removes the sender medium from the observatory if extant', () => {
      const seance = new Observable(['http://localhost/']);
      seance.logger = nullify;

      const observedEmit = jest.spyOn(seance, 'emit');

      seance.init();

      // first, register the medium
      window.dispatchEvent(message({
        origin: 'http://localhost/' /* needed override given window.location comparison in `incorporate` */,
        data: payload({ payload: generateUUID() })
      }));

      expect(seance.observatory.size).toBe(1);

      expect(observedEmit).toHaveBeenCalled();

      // now send DESTROY/CLOSE signal
      window.dispatchEvent(message({
        origin: 'http://localhost/',
        data: payload({
          payload: generateUUID(),
          type: EVENT_TYPES.UNMOUNT,
          id: 1
        })
      }));

      expect(seance.observatory.size).toBe(0);
    });
  });

  describe('recv', () => {
    it('returns if the payload is absent either an origin(todo) or data', () => {
      const origin = 'http://localhost/';

      const seance = new Observable([origin]);
      seance.logger = nullify;

      seance.init();

      const observed = jest.spyOn(seance.pool, 'findIndex');

      window.dispatchEvent(message({ origin, data: false }));

      expect(observed).not.toHaveBeenCalled();
    });

    it('returns if the data is not a serialized (string) payload', () => {
      const origin = 'http://localhost/';

      const seance = new Observable([origin]);
      seance.logger = nullify;

      seance.init();

      const observed = jest.spyOn(seance.pool, 'findIndex');

      window.dispatchEvent(message(new MessageEvent('message', {
        origin,
        data: { a: 1, b: 2 }
      })));

      expect(observed).not.toHaveBeenCalled();
    });

    it('returns if the sender origin is not extant in the pool', () => {
      const origin = 'http://localhost/';

      const seance = new Observable([origin]);
      seance.logger = nullify;

      seance.init();

      // first, register the medium
      window.dispatchEvent(message({
        origin,
        data: payload({ payload: generateUUID() })
      }));

      seance.logger = jest.fn();

      window.dispatchEvent(message({ origin: 'x' }));

      expect(seance.logger).not.toHaveBeenCalled();
    });

    it('returns if an id, type, or payload is absent from the deserialized data object', () => {
      const origin = 'http://localhost/';

      const seance = new Observable([origin]);
      seance.logger = nullify;

      const observed = jest.spyOn(seance.pool, 'findIndex');

      seance.init();

      // first, register the medium
      window.dispatchEvent(message({
        origin,
        data: payload({ payload: generateUUID() })
      }));

      seance.logger = jest.fn();

      window.dispatchEvent(message({
        origin,
        data: payload({ payload: null })
      }));

      window.dispatchEvent(message({
        origin,
        data: payload({ type: null })
      }));

      window.dispatchEvent(message({
        origin,
        data: payload({ id: null })
      }));

      expect(observed).toHaveBeenCalledTimes(4);
      expect(seance.logger).not.toHaveBeenCalled();
    });

    // assuming valid sender
    it('invokes `incorporate` with the sender origin, id upon receipt of a MOUNT signal', () => {
      const [observed, origin] = initTransaction('incorporate');

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(1);
      expect(observed).toBeCalledWith(origin, 1);
    });

    it('invokes `eject` with the sender origin, id upon receipt of a UNMOUNT signal', () => {
      const [observed, origin] = initTransaction('eject');

      expect(observed).not.toHaveBeenCalled();

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: EVENT_TYPES.UNMOUNT
        })
      }));

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(1);
      expect(observed).toHaveBeenCalledWith(origin, 1);
    });

    it('emits a SYN response upon receipt of a ACK signal', () => {
      const [observed, origin] = initTransaction('emit');

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: EVENT_TYPES.SYN
        })
      }));

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(2);
      expect(observed).toHaveBeenCalledWith({
        id: 1,
        error: null,
        result: EVENT_TYPES.ACK
      }, origin);
    });

    it('invokes `get` with the sender\'s payload upon receipt of a GET signal', () => {
      const [observed, origin] = initTransaction('get');

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.GET
        })
      }));

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(1);
      expect(observed).toHaveBeenCalledWith(['key']);
    });

    it('invokes `set` with the sender\'s payload upon receipt of a SET signal', () => {
      const [observed, origin] = initTransaction('set');

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.SET,
          payload: [{ key: 'v' }]
        })
      }));

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(1);
      expect(observed).toHaveBeenCalledWith([{ key: 'v' }]);
    });

    it('invokes `delete` with the sender\'s payload upon receipt of a DELETE signal', () => {
      const [observed, origin] = initTransaction('delete');

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.DELETE
        })
      }));

      expect(observed).toHaveBeenCalled();
      expect(observed).toHaveBeenCalledTimes(1);
      expect(observed).toHaveBeenCalledWith(['key']);
    });

    it('returns if the event type is not a registered event', () => {
      const [observed, origin] = initTransaction('processAction');

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: 'QUERY_TYPES',
          payload: [{ key: 'v' }]
        })
      }));

      expect(observed).not.toHaveBeenCalled();
    });
  });
});
