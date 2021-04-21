import '@testing-library/jest-dom';

import { Observable } from '../lib/core';
import { nullify, generateUUID, EVENT_TYPES } from '../lib/utils';

beforeAll(() => {
   global.payload = function ({ id = 1, type = EVENT_TYPES.MOUNT, payload = ['key'] } = {}) {
    return JSON.stringify({
      id,
      type,
      payload
    });
  }

  global.message = function ({ origin = 'http://localhost:8001', data = payload() } = {}) {
    return new MessageEvent('message', {
      origin,
      data
    });
  }

  global.initTransaction = function (watch) {
    const origin = 'http://localhost/';

    const seance = new Observable([origin]);
    seance.logger = nullify;

    const observed = jest.spyOn(seance, watch);

    seance.init();

    // first, register the medium
    window.dispatchEvent(message({
      origin,
      data: payload({ payload: generateUUID() })
    }));

    return [observed, origin];
  }
});


beforeEach(() => {
  global.postMessage = window.postMessage = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();

  document.head.innerHTML = '';

  localStorage.clear();
});



