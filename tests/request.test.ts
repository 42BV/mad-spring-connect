import { downloadFile, get, patch, post, put, remove } from '../src/request.js';
import axios from 'axios';
jest.mock('axios');

// Note that we test all the requests with the default middleware
describe('requests', () => {
  describe('get', () => {
    test('200: without query parameters', async () => {
      expect.assertions(3);

      const request = get('/api/pokemon/1');

      axios.mockResolvedValueponseFor('/api/pokemon/1', { data: { id: 1 } });

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/pokemon/1');
    });

    test('200: with query parameters', async () => {
      expect.assertions(3);

      const request = get('/api/pokemon', { page: 1 });

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon?page=1', response);

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/pokemon?page=1');
    });

    test('500: server error', async () => {
      expect.assertions(2);

      const request = get('/api/pokemon', { page: 1 });

      mockAxios.mockError('Internal Server Error');

      await expect(request).rejects.toBe('Internal Server Error');
      expect(mockAxios.get).toHaveBeenCalledWith('/api/pokemon?page=1');
    });
  });

  describe('post', () => {
    test('200', async () => {
      expect.assertions(3);

      const request = post('/api/pokemon', { name: 'bulbasaur' });

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/pokemon', {
        name: 'bulbasaur'
      });
    });

    test('500: server error', async () => {
      expect.assertions(2);

      const request = post('/api/pokemon', { name: 'bulbasaur' });

      mockAxios.mockError('Internal Server Error');

      await expect(request).rejects.toBe('Internal Server Error');
      expect(mockAxios.post).toHaveBeenCalledWith('/api/pokemon', {
        name: 'bulbasaur'
      });
    });

    test('200: custom payload', async () => {
      expect.assertions(2);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json'
      });
      payload.append('pokemon', blob);

      const request = post('/api/pokemon', payload);

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toEqual({ id: 1 });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/pokemon', payload);
    });

    test('200: primitive payload', async () => {
      expect.assertions(2);

      const request = post('/api/pokemon', true);

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.post).toHaveBeenCalledWith('/api/pokemon', true);
    });
  });

  describe('put', () => {
    test('200', async () => {
      expect.assertions(3);

      const request = put('/api/pokemon/1', { name: 'bulbasaur' });

      mockAxios.mockResponseFor('/api/pokemon/1', {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.put).toHaveBeenCalledTimes(1);
      expect(mockAxios.put).toHaveBeenCalledWith('/api/pokemon/1', {
        name: 'bulbasaur'
      });
    });

    test('500: server error', async () => {
      expect.assertions(2);

      const request = put('/api/pokemon/1', { name: 'bulbasaur' });

      mockAxios.mockError('Internal Server Error');

      await expect(request).rejects.toBe('Internal Server Error');
      expect(mockAxios.put).toHaveBeenCalledWith('/api/pokemon/1', {
        name: 'bulbasaur'
      });
    });

    test('200: custom payload', async () => {
      expect.assertions(2);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json'
      });
      payload.append('pokemon', blob);

      const request = put('/api/pokemon', payload);

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.put).toHaveBeenCalledWith('/api/pokemon', payload);
    });

    test('200: primitive payload', async () => {
      expect.assertions(2);

      const request = put('/api/pokemon/1', 10);

      mockAxios.mockResponseFor('/api/pokemon/1', {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      await expect(request).resolves.toEqual({ id: 1 });

      expect(mockAxios.put).toHaveBeenCalledWith('/api/pokemon/1', 10);
    });
  });

  describe('patch', () => {
    test('200', async () => {
      expect.assertions(3);

      const request = patch('/api/pokemon/1', { name: 'bulbasaur' });

      mockAxios.mockResponseFor('/api/pokemon/1', {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/pokemon/1', {
        name: 'bulbasaur'
      });
    });

    test('500: server error', async () => {
      expect.assertions(2);

      const request = patch('/api/pokemon/1', { name: 'bulbasaur' });

      mockAxios.mockError('Internal Server Error');

      await expect(request).rejects.toBe('Internal Server Error');
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/pokemon/1', {
        name: 'bulbasaur'
      });
    });

    test('200: custom payload', async () => {
      expect.assertions(2);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json'
      });
      payload.append('pokemon', blob);

      const request = patch('/api/pokemon', payload);

      const response = {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      };
      mockAxios.mockResponseFor('/api/pokemon', response);

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/pokemon', payload);
    });

    test('200: primitive payload', async () => {
      expect.assertions(2);

      const request = patch('/api/pokemon/1', 'si');

      mockAxios.mockResponseFor('/api/pokemon/1', {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.patch).toHaveBeenCalledWith('/api/pokemon/1', 'si');
    });
  });

  describe('remove', () => {
    test('200', async () => {
      expect.assertions(3);

      const request = remove('/api/pokemon/1');

      mockAxios.mockResponseFor('/api/pokemon/1', {
        data: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      await expect(request).resolves.toEqual({ id: 1 });
      expect(mockAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/pokemon/1');
    });

    test('500: server error', async () => {
      expect.assertions(2);

      const request = remove('/api/pokemon/1');

      mockAxios.mockError('Internal Server Error');

      await expect(request).rejects.toBe('Internal Server Error');
      expect(mockAxios.delete).toHaveBeenCalledWith('/api/pokemon/1');
    });
  });

  describe('downloadFile', () => {
    const createObjectURLSpy = jest.fn();
    const revokeObjectURLSpy = jest.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;
    const clickSpy = jest.fn();
    const setAttributeSpy = jest.fn();
    const removeSpy = jest.fn();
    const createElementSpy = jest.spyOn(document, 'createElement');

    beforeEach(() => {
      createObjectURLSpy.mockReturnValue('object');
      // @ts-expect-error Test mock
      createElementSpy.mockReturnValue({
        click: clickSpy,
        setAttribute: setAttributeSpy,
        remove: removeSpy
      });
    });

    afterEach(() => {
      createElementSpy.mockReset();
      createObjectURLSpy.mockReset();
      revokeObjectURLSpy.mockReset();
      clickSpy.mockReset();
      setAttributeSpy.mockReset();
      removeSpy.mockReset();
    });

    afterAll(() => {
      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    test('with content-disposition', async () => {
      expect.assertions(13);
      const request = downloadFile('test');

      mockAxios.mockResponseFor('test', {
        data: 'testFile',
        headers: {
          'Content-Type': 'json',
          'content-disposition': 'filename=test.test'
        }
      });

      await expect(request).resolves.toBeUndefined();
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('test', {
        responseType: 'blob'
      });

      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(createObjectURLSpy).toHaveBeenCalledWith('testFile');
      expect(setAttributeSpy).toHaveBeenCalledTimes(1);
      expect(setAttributeSpy).toHaveBeenCalledWith('download', 'test.test');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('object');
    });

    test('with content-disposition and queryParams', async () => {
      expect.assertions(13);
      const request = downloadFile('test', { sort: 'id,asc' });

      mockAxios.mockResponseFor('test?sort=id%2Casc', {
        data: 'testFile',
        headers: {
          'Content-Type': 'json',
          'content-disposition': 'filename=test.test'
        }
      });

      await expect(request).resolves.toBeUndefined();
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('test?sort=id%2Casc', {
        responseType: 'blob'
      });

      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(createObjectURLSpy).toHaveBeenCalledWith('testFile');
      expect(setAttributeSpy).toHaveBeenCalledTimes(1);
      expect(setAttributeSpy).toHaveBeenCalledWith('download', 'test.test');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('object');
    });

    test('without content-disposition', async () => {
      expect.assertions(9);
      const request = downloadFile('test');

      mockAxios.mockResponseFor('test', {
        data: 'error',
        headers: { 'Content-Type': 'json' }
      });

      await expect(request).resolves.toBeUndefined();
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockAxios.get).toHaveBeenCalledWith('test', {
        responseType: 'blob'
      });

      expect(document.createElement).toHaveBeenCalledTimes(0);
      expect(createObjectURLSpy).toHaveBeenCalledTimes(0);
      expect(setAttributeSpy).toHaveBeenCalledTimes(0);
      expect(clickSpy).toHaveBeenCalledTimes(0);
      expect(removeSpy).toHaveBeenCalledTimes(0);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(0);
    });
  });
});
