import { Observable, Observer } from '../lib/core';
import { Seance, Medium } from '../lib';

describe('Evaluation of library entrypoint', () => {
  describe('Seance initialization', () => {
    it('returns an instance of Observable', () => {
      const seance = Seance(['http://localhost:9000']);

      expect(seance).toBeInstanceOf(Observable);
    });

    it('throws if passed a non-array origin set', () => {
      expect(() => Seance('http://localhost:9000')).toThrow();
    });

    it('throws if passed a non-boolean logger indicator', () => {
      expect(() => Seance(['http://localhost:9000'], { logger: 'true' })).toThrow();
    });

    it('throws if passed a non-boolean verbose indicator', () => {
      expect(() => Seance(['http://localhost:9000'], { logger: true, verbose: 'true' })).toThrow();
    });
  });

  describe('Medium initialization', () => {
    it('returns an instance of Observer', () => {
      const medium = Medium({
        seanceOrigin: 'url'
      });

      expect(medium).toBeInstanceOf(Observer);
    });

    it('throws if passed a non-string seanceOrigin', () => {
      expect(() => Medium({
        seanceOrigin: 9
      })).toThrow();
    });

    it('throws if passed a non-function created', () => {
      expect(() => Medium({
        seanceOrigin: 'http://localhost:9000',
        created: '9'
      })).toThrow();
    });

    it('throws if passed a non-function destroyed', () => {
      expect(() => Medium({
        seanceOrigin: 'http://localhost:9000',
        destroyed: '9'
      })).toThrow();    });
  });
});
