import { QUERY_TYPES } from '../../lib/utils';

describe('Evaluation of Seance transaction processing', () => {
  describe('Processor', () => {
    it('tenders an error message give the occurrence of a caught exception', () => {
      const [observed, origin] = initTransaction('emit');

      localStorage.getItem = jest.fn();

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.GET,
          payload: { a: 1 }
        })
      }));

      expect(observed.mock.calls[1][0].result).toBe(null);
      expect(observed.mock.calls[1][0].error).not.toBe(null);
    });
  });

  describe('localStorage interface', () => {
    it('allocates from localStorage the values for all specified keys into a results array', () => {
      const [observed, origin] = initTransaction('emit');

      const key = 'key';
      const value = '99';

      localStorage.setItem(key, value);

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.GET,
          payload: [key]
        })
      }));

      expect(observed.mock.calls[1][0].result).not.toBe(null);
      expect(observed.mock.calls[1][0].result).toEqual([{ [key]: value }]);

      expect(observed.mock.calls[1][0].error).toBe(null);
    });

    it('pushes `null` corresponding value given non-extant storage keys', () => {
      const [observed, origin] = initTransaction('emit');

      const key = 'key';

      window.dispatchEvent(message({
        origin,
        data: payload({
          id: 1,
          type: QUERY_TYPES.GET,
          payload: [key]
        })
      }));

      expect(observed.mock.calls[1][0].result).not.toBe(null);
      expect(observed.mock.calls[1][0].result).toEqual([{ [key]: null }]);

      expect(observed.mock.calls[1][0].error).toBe(null);
    });

    it.todo('pushes `false` corresponding value given erroneous storage operations');
  });
});
