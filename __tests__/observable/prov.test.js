import { Observable } from '../../lib/core';

describe('Evaluation of Seance transaction processing', () => {
  describe('Processor', () => {
    it.todo('attempts to invoke a corresponding API method');
    it.todo('tenders an error message give the occurrence of a caught exception');
  });

  describe('Get', () => {
    it.todo('allocates from localstorage the values for all specified keys into a results array');
    it.todo('pushes `null` corresponding value given non-extant storage keys');
  });

  describe('Set', () => {
    it.todo('sets all specified key/val pairs into localstorage, pushing into a results array a boolean result for ea');
    it.todo('pushes `false` corresponding value given exceptions in setting');
  });

  describe('Delete', () => {
    it.todo('deletes all specified keys from localstorage, pushing into a results array a boolean result for ea');
    it.todo('pushes `false` corresponding value given exceptions in setting');
  });
});
