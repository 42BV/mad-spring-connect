import mockAxios from 'jest-mock-axios';

import { get, patch, post, put, remove } from '../src/request';

// Note that we tests all the requests with the default middleware
describe('requests', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  describe('get', () => {
    test('200: without query parameters', async () => {
      expect.assertions(3);

      const request = get('/api/pokemon/1');

      mockAxios.mockResponseFor('/api/pokemon/1', { data: { id: 1 } });

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
});
