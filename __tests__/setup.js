import '@testing-library/jest-dom';

beforeEach(() => {
  global.postMessage = window.postMessage = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  document.head.innerHTML = ''
});



