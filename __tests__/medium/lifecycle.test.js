import { Observer } from '../../lib/core';

const seanceOrigin = 'http://mock';

describe('Evaluation of Medium lifecycles', () => {
  describe('Mount / Initialization', () => {
    const createdMock = jest.fn();

    const params = {
      created: createdMock,
      seanceOrigin
    };
    const medium = new Observer(params);

    const pollMock = jest.spyOn(medium, 'poll')
      .mockImplementation(() => ({}));

    const mountMock = jest.spyOn(medium, 'mount')
      .mockImplementation(() => ({}));

    medium.init();

    it('invokes `poll` when initialized', () => {
      expect(pollMock).toBeCalled();
      expect(pollMock).toBeCalledTimes(1);
    });

    it ('does not invoke the provided `created` callback prior to mounting', () => {
      expect(createdMock).not.toBeCalled();
      expect(createdMock).toBeCalledTimes(0);
    });

    it('invokes `mount` when \'load\' event has been fired', () => {
      window.dispatchEvent(new Event('load'));

      expect(mountMock).toBeCalled();
      expect(mountMock).toBeCalledTimes(1);
    });
  });

  describe('Create', () => {
    const createdMock = jest.fn();

    const params = {
      created: createdMock,
      seanceOrigin
    };

    const medium = new Observer(params);

    medium.init();

    it ('invokes the provided `created` callback once mounted', () => {
      window.dispatchEvent(new Event('load'));

      expect(createdMock).toBeCalled();
      expect(createdMock).toBeCalledTimes(1);
    });

    it('invokes the provided `created` callback with the Medium\'s uuid', () =>{
      window.dispatchEvent(new Event('load'));

      expect(createdMock).toBeCalledWith(medium.uuid);
    });
  });

  describe('UnMount', () => {
    const destroyedMock = jest.fn();

    const params = {
      destroyed: destroyedMock,
      seanceOrigin
    };

    const medium = new Observer(params);

    const unMountMock = jest.spyOn(medium, 'unMount')
      .mockImplementation((arg) =>  arg);

    medium.init();

    it ('does not invoke the provided `destroyed` callback prior to unMounting', () => {
      expect(destroyedMock).not.toBeCalled();
      expect(destroyedMock).toBeCalledTimes(0);
    });

    it('invokes `unMount` when \'beforeunload\' event has been fired', () => {
      window.dispatchEvent(new Event('beforeunload'));

      expect(unMountMock).toBeCalled();
      expect(unMountMock).toBeCalledTimes(1);
    });
  });

  describe('Destroy', () => {
    const destroyedMock = jest.fn();

    const params = {
      destroyed: destroyedMock,
      seanceOrigin
    };

    const medium = new Observer(params);

    medium.init();

    // very unfortunate
    Object.assign(medium.proxyEl.parentNode, { removeChild () { } });

    it ('invokes the provided `destroyed` callback once unMounted', () => {
      window.dispatchEvent(new Event('beforeunload'));

      expect(destroyedMock).toBeCalled();
      expect(destroyedMock).toBeCalledTimes(1);
    });

    it('invokes the provided `destroyed` callback with the Medium\'s uuid', () =>{
      window.dispatchEvent(new Event('beforeunload'));

      expect(destroyedMock).toBeCalledWith(medium.uuid);
    });
  });

  describe('Listener registration', () => {
    const params = {
      seanceOrigin
    };

    const medium = new Observer(params);

    it('registers window event listeners upon creation', () => {
      const mock = jest.spyOn(window, 'addEventListener');

      medium.init();

      expect(mock).toBeCalled();
      expect(mock).toBeCalledTimes(3);
      // will have been fired 12 times due to propagation

      expect(mock.mock.calls[0].includes('message')).toBe(true);
      expect(mock.mock.calls[1].includes('load')).toBe(true);
      expect(mock.mock.calls[2].includes('beforeunload')).toBe(true);
    });
  });

  describe('Listener removal', () => {
    const params = {
      seanceOrigin
    };

    const medium = new Observer(params);

    medium.init();

    it('unregisters window event listeners upon destruction', () => {
      const mock = jest.spyOn(window, 'removeEventListener');

      window.dispatchEvent(new Event('beforeunload'));

      expect(mock).toBeCalled();

      expect(mock.mock.calls[0].includes('message')).toBe(true);
      expect(mock.mock.calls[1].includes('load')).toBe(true);
      expect(mock.mock.calls[2].includes('beforeunload')).toBe(true);
    });
  });
});
