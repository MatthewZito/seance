import '@testing-library/jest-dom';

beforeEach(() => {
  window.postMessage = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

