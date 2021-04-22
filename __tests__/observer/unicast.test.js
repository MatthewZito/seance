import {
  EVENT_TYPES,
  QUERY_TYPES,
  TIMERS,
  IDENTIFIERS,
  purgePromiseJobs,
  nullify
 } from '../../lib/utils';

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

describe('Evaluation of outbound, unicast messages and communications', () => {
  it('emits a `MOUNT` message when the mount lifecycle is invoked', () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.poll = jest.fn();

    medium.init();

    expect(observedEmit).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));

    expect(observedEmit).toHaveBeenCalled();

    expect(observedEmit.mock.calls[0][0]).toBe(EVENT_TYPES.MOUNT);
    expect(observedEmit.mock.calls[0][1]).toBe(medium.uuid);
  });

  it('emits an `UNMOUNT` message when the unMount lifecycle is invoked', () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');
    medium.poll = jest.fn()

    medium.init();

    expect(observedEmit).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('beforeunload'));

    expect(observedEmit).toHaveBeenCalled();

    expect(observedEmit.mock.calls[0][0]).toBe(EVENT_TYPES.UNMOUNT);
    expect(observedEmit.mock.calls[0][1]).toBe(medium.uuid);
  });

  it('emits a `SYN` message at n interval once `poll` is invoked', () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.init();

    expect(observedEmit.mock.calls.length).toBe(0);

    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(TIMERS.CONN_INTERVAL);

      expect(observedEmit.mock.calls.length).toBe(i + 1);
      expect(observedEmit.mock.calls[0][0]).toBe(EVENT_TYPES.SYN);
      expect(observedEmit.mock.calls[0][1]).toBe(medium.uuid);
      expect(typeof observedEmit.mock.calls[0][2]).toBe('function');
    }
  });

  it('emits a `GET` message when the get api is called', async () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.poll = jest.fn()

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    const args = ['key', 'key2'];
    const cb = jest.fn();

    await medium.sequence()
      .then(api => {
        api.get(args, cb)
      });

    expect(observedEmit.mock.calls[0][0]).toBe(QUERY_TYPES.GET);
    expect(observedEmit.mock.calls[0][1]).toBe(args);
    expect(observedEmit.mock.calls[0][2]).toBe(cb);
  });

  it('emits a `SET` message when the set api is called', async () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.poll = jest.fn()

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    const args = [{ key: 'val' }, { key2: 'val2' }];
    const cb = jest.fn();

    await medium.sequence()
      .then(api => {
        api.set(args, cb)
      });

    expect(observedEmit.mock.calls[0][0]).toBe(QUERY_TYPES.SET);
    expect(observedEmit.mock.calls[0][1]).toBe(args);
    expect(observedEmit.mock.calls[0][2]).toBe(cb);
  });

  it('emits a `DELETE` message when the delete api is called', async () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.poll = jest.fn()

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    const args = ['key1', 'key2'];
    const cb = jest.fn();

    await medium.sequence()
      .then(api => {
        api.delete(args, cb)
      });

    expect(observedEmit.mock.calls[0][0]).toBe(QUERY_TYPES.DELETE);
    expect(observedEmit.mock.calls[0][1]).toBe(args);
    expect(observedEmit.mock.calls[0][2]).toBe(cb);
  });
});

describe('Evaluation of inbound messages and communications', () => {
  it('receives messages via the `message` event', () => {
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    // to avoid unnecessary complexity, we format default messages here as having the same arity
    // as a DESTROY/CLOSE signal
    // this will trigger the `preflight` flag back to null; so long as we initialize the flag as CONN_FULFILLED
    // the toggling of the flag will inform us that the message was indeed recv and processed
    window.dispatchEvent(message());

    expect(observedRecv).toHaveBeenCalled();
    expect(medium.preflight).toBe(null);
  });


  it('drops messages from origins other than that of the Seance', () => {
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    // override origin to something *other* than the seanceOrigin
    window.dispatchEvent(message({ origin: 'not' }));

    expect(observedRecv).toHaveBeenCalled();
    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);
  });

  it('drops messages that do not have data', () => {
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    window.dispatchEvent(message({ data: null }));

    expect(observedRecv).toHaveBeenCalled();
    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);
  });

  it('drops messages whose data is not serialized', () => {
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    window.dispatchEvent(message({ data: {
      a: 'notSerialized'
    }}));

    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);

    window.dispatchEvent(message());

    expect(medium.preflight).toBe(null);
  });

  it('drops messages whose data does not contain an id OR an error and result', () => {
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    const missingId = JSON.stringify({
      error: 'T',
      result: 'T'
    });

    window.dispatchEvent(message({ data: missingId }));

    expect(observedRecv).toHaveBeenCalled();
    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);

    const missingData = JSON.stringify({
      id: 'T'
    });

    window.dispatchEvent(message({ data: missingData }));

    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);
  });

  it('sets the `preflight` flag to `null` upon receipt of a destroy id and close event', () => {
    // this is the default impl of a message for this suite, so...
    const medium = makeMedium();

    const observedRecv = jest.spyOn(medium, 'recv');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    expect(observedRecv).not.toHaveBeenCalled();

    window.dispatchEvent(message());

    expect(observedRecv).toHaveBeenCalled();
    expect(medium.preflight).toBe(null);
  });

  it('returns upon receipt of a destroy id and close event', () => {
    const medium = makeMedium();

    const observedMapCheck = jest.spyOn(medium.responses, 'has');

    medium.init();

    window.dispatchEvent(message());

    // we'll never reach this point in the code after DESTROY/CLOSE
    expect(observedMapCheck).not.toHaveBeenCalled();
  });

  it('sets the `preflight` flag to `fulfilled` upon receipt of an ACK signal', () => {
    const medium = makeMedium();

    const id = '_V_';
    // ensure the id is in the responses map, else the Medium will drop message
    medium.responses.set(id, () => ({}));

    medium.init();

    expect(medium.preflight).toBe(null);
    window.dispatchEvent(message({ data: payload({ id, result: EVENT_TYPES.ACK }) }));
    expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);
  });

  it('invokes the callback from the responses map that corresponds to the message id', async () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.poll = jest.fn()

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    const args = ['key', 'key2'];
    const cb = jest.fn();

    expect(observedEmit).not.toHaveBeenCalled();

    await medium.sequence()
      .then(api => {
        api.get(args, cb)
      });

    expect(observedEmit).toHaveBeenCalledTimes(1);

    const callbackResult = 'OK';

    const data = payload({
      // first api-bound message, it should be 1
      id: 1,
      error: null,
      result: callbackResult
    });

    expect(cb).not.toHaveBeenCalled();
    window.dispatchEvent(message({ data }));

    purgePromiseJobs().then(() => {
      expect(cb).toHaveBeenCalled();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(null, callbackResult);
    });
  });

  it('removes the received id from the responses map in all cases of an accepted message', async () => {
    const medium = makeMedium();

    const observedEmit = jest.spyOn(medium, 'emit');

    medium.init();

    medium.preflight = TIMERS.CONN_FULFILLED;

    const args = ['key', 'key2'];
    const cb = jest.fn();

    expect(observedEmit).not.toHaveBeenCalled();

    await medium.sequence()
      .then(api => {
        api.get(args, cb)
      });

    // `get` should add message id to responses map
    expect(medium.responses.size).toBe(1);

    expect(observedEmit).toHaveBeenCalledTimes(1);

    const callbackResult = 'OK';

    const data = payload({
      id: 1,
      error: null,
      result: callbackResult
    });

    expect(cb).not.toHaveBeenCalled();

    window.dispatchEvent(message({ data }));

    purgePromiseJobs().then(() => {
      expect(cb).toHaveBeenCalled();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(null, callbackResult);

      // responses map should be empty
      expect(medium.responses.size).toBe(0);
    });
  });
});
