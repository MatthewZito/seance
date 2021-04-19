import { EVENT_TYPES, QUERY_TYPES, TIMERS, IDENTIFIERS, purgePromiseJobs } from '../../lib/utils';
import { Observer } from '../../lib/core';

function payload ({ id = IDENTIFIERS.DESTROY_ID, error = null, result = EVENT_TYPES.CLOSE } = {}) {
  return JSON.stringify({
    id,
    error,
    result
  });
}

function message ({ origin = 'http://mock', data = payload() } = {}) {
  return new MessageEvent('message', {
    origin,
    data
  });
}

const seanceOrigin = 'http://mock';

describe('Evaluation of public API', () => {
  describe('Sequence API', () => {
    it('resolves and returns an API object when a connection is established', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const callbackMock = jest.fn();
      const errMock = jest.fn();

      await medium.sequence()
        .then(callbackMock)
        .catch(errMock)

      expect(errMock).not.toHaveBeenCalled();
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('returns an API object with `get`, `set` and `delete` methods, each contextually bound', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const callbackMock = jest.fn();

      await medium.sequence()
        .then(callbackMock);

      expect(callbackMock.mock.calls[0][0].get).toBeDefined();
      expect(callbackMock.mock.calls[0][0].set).toBeDefined();
      expect(callbackMock.mock.calls[0][0].delete).toBeDefined();

      expect(Object.create(medium.get.prototype) instanceof callbackMock.mock.calls[0][0].get);
      expect(Object.create(medium.set.prototype) instanceof callbackMock.mock.calls[0][0].set);
      expect(Object.create(medium.delete.prototype) instanceof callbackMock.mock.calls[0][0].delete);

    });

    // it(`recurses and attempts connection up to ${TIMERS.MAX_CONN_ATTEMPTS} times before rejecting`, async () => {
    //   const medium = new Observer({
    //     seanceOrigin
    //   });

    //   medium.init();

    //   const callbackMock = jest.fn();
    //   const errMock = jest.fn();

    //   expect(callbackMock).not.toHaveBeenCalled();
    //   expect(errMock).not.toHaveBeenCalled();

    //   jest.useRealTimers();
    //   jest.setTimeout(8000);

    //   setTimeout(() => {
    //     medium.preflight = TIMERS.CONN_FULFILLED;
    //   }, TIMERS.CONN_FULFILLED * 2);

    //   await medium.sequence(10).then(callbackMock).catch(errMock);

    //   expect(callbackMock).toHaveBeenCalled();
    //   expect(errMock).not.toHaveBeenCalled();
    // });

    // it(`rejects if unable to establish a connection after recursing ${TIMERS.MAX_CONN_ATTEMPTS}`, async () => {
    //   const medium = new Observer({
    //     seanceOrigin
    //   });

    //   medium.init();

    //   const callbackMock = jest.fn();
    //   const errMock = jest.fn();

    //   expect(callbackMock).not.toHaveBeenCalled();
    //   expect(errMock).not.toHaveBeenCalled();

    //   jest.useRealTimers();
    //   jest.setTimeout(8000);

    //   await medium.sequence(10).then(callbackMock).catch(errMock);

    //   expect(callbackMock).not.toHaveBeenCalled();
    //   expect(errMock).toHaveBeenCalled();
    // });
  });

  describe('API method `get`', () => {
    it('throws if a non-array is provided as input', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const api = await medium.sequence()
        .then(api => api);

      expect(() => api.get('test')).toThrow();
      expect(() => api.get(1)).toThrow();
      expect(() => api.get({ k:1 })).toThrow();

      expect(() => api.get([ 'v' ])).not.toThrow();
    });

    it('throws if provided arguments array contains types other than strings, numbers', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const api = await medium.sequence()
        .then(api => api);

      expect(() => api.get(['test', 1])).not.toThrow();
      expect(() => api.get([{ k:1 }, null])).toThrow();
    });

    it('throws if a non-function is provided as a callback', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const api = await medium.sequence()
        .then(api => api);

      expect(() => api.get(['test', 1], () => ({}))).not.toThrow();
      expect(() => api.get(['test', 1], 'l')).toThrow();
      expect(() => api.get(['test', 1], 9)).toThrow();
    });

    it('resolves the provided callback when a response of a corresponding id is received', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      const observedEmit = jest.spyOn(medium, 'emit');

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const args = ['key', 'key2'];

      const cb1 = jest.fn();
      const cb2 = jest.fn();

      await medium.sequence()
        .then(api => {
          api.get(args, cb1);
          api.get(args, cb2);
        });

      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).not.toHaveBeenCalled();

      window.dispatchEvent(message({
        data: payload({
          id: 1,
          error: null,
          result: 'no'
        })
      }));

      window.dispatchEvent(message({
        data: payload({
          id: 2,
          error: null,
          result: 'OK'
        })
      }));

      purgePromiseJobs().then(() => {
        expect(cb1).toHaveBeenCalled();
        expect(cb1).toBeCalledTimes(1);
        expect(cb1).toBeCalledWith(null, 'no');

        expect(cb2).toHaveBeenCalled();
        expect(cb2).toBeCalledTimes(1);
        expect(cb2).toBeCalledWith(null, 'OK');
      });
    });

    it.todo('*** throws if not initialized via a sequence');
  });

  describe('API method `set`', () => {
    it('throws if a non-array is provided as input', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const api = await medium.sequence()
        .then(api => api);

      expect(() => api.set('test')).toThrow();
      expect(() => api.set(1)).toThrow();
      expect(() => api.set({ k:1 })).toThrow();

      expect(() => api.set([{ k: 'v' }])).not.toThrow();
    });

    it('throws if a non-function is provided as a callback', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const api = await medium.sequence()
        .then(api => api);

      expect(() => api.set([{ test: 1 }], () => ({}))).not.toThrow();
      expect(() => api.set([{ test: 1 }], 'l')).toThrow();
      expect(() => api.set([{ test: 1 }], 9)).toThrow();
    });

    it('resolves the provided callback when a response of a corresponding id is received', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      const args = [{ key: 1 }];
      const cb1 = jest.fn();
      const cb2 = jest.fn();

      await medium.sequence()
        .then(api => {
          api.set(args, cb1);
          api.set(args, cb2);
        });

      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).not.toHaveBeenCalled();

      window.dispatchEvent(message({
        data: payload({
          id: 1,
          error: null,
          result: 'no'
        })
      }));

      window.dispatchEvent(message({
        data: payload({
          id: 2,
          error: null,
          result: 'OK'
        })
      }));

      purgePromiseJobs().then(() => {
        expect(cb1).toHaveBeenCalled();
        expect(cb1).toBeCalledTimes(1);
        expect(cb1).toBeCalledWith(null, 'no');

        expect(cb2).toHaveBeenCalled();
        expect(cb2).toBeCalledTimes(1);
        expect(cb2).toBeCalledWith(null, 'OK');
      });
    });

    it.todo('throws if provided arguments array contains types other than objects');

    it.todo('*** throws if not initialized via a sequence');
  });

  describe('API method `delete`', () => {
    it.todo('throws if provided arguments array contains types other than objects');

    it.todo('*** throws if not initialized via a sequence');
  });

  describe('Base public interface laws', () => {
    it('exposes only public methods in each sequence', async () => {
      const medium = new Observer({
        seanceOrigin
      });

      medium.init();

      medium.preflight = TIMERS.CONN_FULFILLED;

      await medium.sequence()
        .then(api => {
          expect(api).toHaveProperty('get');
          expect(api).toHaveProperty('set');
          expect(api).toHaveProperty('delete');
          expect(api).not.toHaveProperty('init');
          expect(api).not.toHaveProperty('preflight');
          expect(api).not.toHaveProperty('emit');
        });
    });
  })
});
