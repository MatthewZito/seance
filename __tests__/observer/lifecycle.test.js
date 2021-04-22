import { nullify } from '../../lib/utils';
import { Observer } from '../../lib/core';

const seanceOrigin = 'http://mock';

describe('Evaluation of Medium lifecycles', () => {
  describe('Mount / Initialization', () => {
    const createdMock = jest.fn();

    const params = {
      created: createdMock,
      destroyed: nullify,
      seanceOrigin
    };
    const medium = new Observer(params);

    const pollMock = jest.spyOn(medium, 'poll')
      .mockImplementation(() => ({}));

    const mountMock = jest.spyOn(medium, 'mount')
      .mockImplementation(() => ({}));

    medium.init();

    it('invokes `poll` when initialized', () => {
      expect(pollMock).toHaveBeenCalled();
      expect(pollMock).toHaveBeenCalledTimes(1);
    });

    it ('does not invoke the provided `created` callback prior to mounting', () => {
      expect(createdMock).not.toHaveBeenCalled();
      expect(createdMock).toHaveBeenCalledTimes(0);
    });

    it('invokes `mount` when \'load\' event has been fired', () => {
      window.dispatchEvent(new Event('load'));

      expect(mountMock).toHaveBeenCalled();
      expect(mountMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Create', () => {
    const createdMock = jest.fn();

    const params = {
      created: createdMock,
      destroyed: nullify,
      seanceOrigin
    };

    const medium = new Observer(params);

    medium.init();

    it ('invokes the provided `created` callback once mounted', () => {
      window.dispatchEvent(new Event('load'));

      expect(createdMock).toHaveBeenCalled();
      expect(createdMock).toHaveBeenCalledTimes(1);
    });

    it('invokes the provided `created` callback with the Medium\'s uuid', () =>{
      window.dispatchEvent(new Event('load'));

      expect(createdMock).toHaveBeenCalledWith(medium.uuid);
    });
  });

  describe('UnMount', () => {
    const destroyedMock = jest.fn();

    const params = {
      destroyed: destroyedMock,
      created: nullify,
      seanceOrigin
    };

    const medium = new Observer(params);

    const unMountMock = jest.spyOn(medium, 'unMount')
      .mockImplementation((arg) =>  arg);

    medium.init();

    it ('does not invoke the provided `destroyed` callback prior to unMounting', () => {
      expect(destroyedMock).not.toHaveBeenCalled();
      expect(destroyedMock).toHaveBeenCalledTimes(0);
    });

    it('invokes `unMount` when \'beforeunload\' event has been fired', () => {
      window.dispatchEvent(new Event('beforeunload'));

      expect(unMountMock).toHaveBeenCalled();
      expect(unMountMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Destroy', () => {
    const destroyedMock = jest.fn();

    const params = {
      created: nullify,
      destroyed: destroyedMock,
      seanceOrigin
    };

    const medium = new Observer(params);

    medium.init();

    // very unfortunate
    Object.assign(medium.proxyEl.parentNode, { removeChild () { } });

    it ('invokes the provided `destroyed` callback once unMounted', () => {
      window.dispatchEvent(new Event('beforeunload'));

      expect(destroyedMock).toHaveBeenCalled();
      expect(destroyedMock).toHaveBeenCalledTimes(1);
    });

    it('invokes the provided `destroyed` callback with the Medium\'s uuid', () =>{
      window.dispatchEvent(new Event('beforeunload'));

      expect(destroyedMock).toHaveBeenCalledWith(medium.uuid);
    });
  });

  describe('Listener registration', () => {
    it('registers window event listeners upon creation', () => {
      const medium = makeMedium();
      const mock = jest.spyOn(window, 'addEventListener');

      medium.init();

      expect(mock).toHaveBeenCalled();
      expect(mock).toHaveBeenCalledTimes(3);

      expect(mock.mock.calls[0].includes('message')).toBe(true);
      expect(mock.mock.calls[1].includes('load')).toBe(true);
      expect(mock.mock.calls[2].includes('beforeunload')).toBe(true);
    });
  });

  describe('Listener removal', () => {
    it('unregisters window event listeners upon destruction', () => {
      const medium = makeMedium().init();

      const mock = jest.spyOn(window, 'removeEventListener');

      window.dispatchEvent(new Event('beforeunload'));

      expect(mock).toHaveBeenCalled();

      expect(mock.mock.calls[0].includes('message')).toBe(true);
      expect(mock.mock.calls[1].includes('load')).toBe(true);
      expect(mock.mock.calls[2].includes('beforeunload')).toBe(true);
    });
  });
});
