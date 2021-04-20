import { EVENT_TYPES, generateUUID, IDENTIFIERS, nullify } from '../../lib/utils';
import { Observable } from '../../lib/core';

const origins = ['http://localhost:8001', 'http://localhost:8002'];

function payload ({ id = 1, type = EVENT_TYPES.MOUNT, payload = ['key'] } = {}) {
  return JSON.stringify({
    id,
    type,
    payload
  });
}

function message ({ origin = 'http://localhost:8001', data = payload() } = {}) {
  return new MessageEvent('message', {
    origin,
    data
  });
}

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
    it.todo('returns if the payload is absent either an origin or data');
    it.todo('returns if the data is not a serialized (string) payload');
    it.todo('returns if the sender origin is not extant in the pool');
    it.todo('returns if an id, type, or payload is absent from the deserialized data object');

    // assuming valid sender
    it.todo('invokes `incorporate` with the sender origin, id upon receipt of a MOUNT signal');
    it.todo('invokes `eject` with the sender origin, id upon receipt of a UNMOUNT signal');
    it.todo('emits a SYN response upon receipt of a ACK signal');

    it.todo('invokes `get` with the deserialized data, sender origin upon receipt of a GET signal');
    it.todo('invokes `set` with the deserialized data, sender origin upon receipt of a SET signal');
    it.todo('invokes `delete` with the deserialized data, sender origin upon receipt of a DELETE signal');
    it.todo('returns if the event type is not a registered event');
  });
});
