import { EVENT_TYPES, TIMERS } from '../../lib/utils';
import { Observer } from '../../lib/core';

const seanceOrigin = 'http://mock';

describe('Evaluation of networking and connection initializers', () => {
  const params = {
    seanceOrigin
  };
  describe('SYN Unicast', () => {
    it('initializes a polling SYN broadcast after `init`', () => {
      const medium = new Observer(params);
      const observedPoll = jest.spyOn(medium, 'poll');

      expect(observedPoll).not.toHaveBeenCalled();

      medium.init();

      expect(observedPoll).toHaveBeenCalled();

      expect(setInterval).toHaveBeenCalledTimes(1, TIMERS.CONN_INTERVAL);
    });

    it('invokes `emit` to send the SYN broadcast on each interval', () => {
      const medium = new Observer(params);
      const observedEmit = jest.spyOn(medium, 'emit');

      expect(observedEmit).not.toHaveBeenCalled();

      medium.init();

      expect(observedEmit).not.toHaveBeenCalled();

      jest.advanceTimersByTime(TIMERS.CONN_INTERVAL);
      expect(observedEmit).toHaveBeenCalled();

    });

    it('invokes `emit` with SYN message \'packets\'', () => {
      const medium = new Observer(params);
      const observedEmit = jest.spyOn(medium, 'emit');

      medium.init();
      jest.advanceTimersByTime(TIMERS.CONN_INTERVAL);

      expect(observedEmit.mock.calls[0][0]).toBe(EVENT_TYPES.SYN);
      expect(observedEmit.mock.calls[0][1]).toBe(medium.uuid);
      // TODO get bound ref
      expect(typeof observedEmit.mock.calls[0][2]).toBe('function');
    });

    it('invokes `emit` with SYN message \'packets\'', () => {
      const medium = new Observer(params);
      const observedEmit = jest.spyOn(medium, 'emit');

      medium.init();
      jest.advanceTimersByTime(TIMERS.CONN_INTERVAL);

      expect(observedEmit.mock.calls[0][0]).toBe(EVENT_TYPES.SYN);
      expect(observedEmit.mock.calls[0][1]).toBe(medium.uuid);
      // TODO get bound ref
      expect(typeof observedEmit.mock.calls[0][2]).toBe('function');
    });
  });

  describe('Preflight flags', () => {
    const medium = new Observer(params);
    jest.spyOn(medium, 'onAcknowledge');

    medium.init();

    it('initializes with the `preflight` flag set to null', () => {
      expect(medium.preflight).toBeNull();
    });

    it('sets the `preflight` flag set to fulfilled when `onAcknowledge is invoked`', () => {
      medium.onAcknowledge();
      expect(medium.preflight).toBe(TIMERS.CONN_FULFILLED);
    });
  });
});
