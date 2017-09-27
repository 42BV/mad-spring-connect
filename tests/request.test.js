import fetchMock from 'fetch-mock';

import * as middleware from '../src/middleware';

import { configureMadConnect } from '../src/config';

import { get, post, put, remove, patch } from '../src/request';

// Note that we tests all the requests with the default middleware
describe('requests', () => {
  beforeEach(() => {
    middleware.checkStatus = jest.fn(middleware.checkStatus);
    middleware.parseJSON = jest.fn(middleware.parseJSON);

    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON]
    });
  });

  afterEach(() => {
    expect(middleware.checkStatus).toHaveBeenCalledTimes(1);
    expect(middleware.parseJSON).toHaveBeenCalledTimes(1);

    fetchMock.restore();
  });

  describe('get', () => {
    test('200: without query parameters', async done => {
      fetchMock.get('api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await get('api/pokemon/1');
      expect(json).toEqual({ id: 1 });

      done();
    });

    test('200: with query parameters', async done => {
      fetchMock.get('api/pokemon?page=1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await get('api/pokemon', { page: 1 });
      expect(json).toEqual({ id: 1 });

      done();
    });

    test('500: server error', async done => {
      fetchMock.get('api/pokemon?page=1', 500);

      try {
        const json = await get('api/pokemon', { page: 1 });
        fail();
      } catch (e) {
        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.get('api/pokemon?page=1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      try {
        const json = await get('api/pokemon', { page: 1 });
        fail();
      } catch (e) {
        expect(e.message).toBe(
          'invalid json response body at api/pokemon?page=1 reason: Unexpected token } in JSON at position 2'
        );

        done();
      }
    });
  });

  describe('post', () => {
    test('200', async done => {
      fetchMock.post('api/pokemon', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await post('api/pokemon', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      done();
    });

    test('500: server error', async done => {
      fetchMock.post('api/pokemon', 500);

      try {
        const json = await post('api/pokemon', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.post('api/pokemon', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      try {
        const json = await post('api/pokemon', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at api/pokemon reason: Unexpected token } in JSON at position 2'
        );

        done();
      }
    });
  });

  describe('put', () => {
    test('200', async done => {
      fetchMock.put('api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await put('api/pokemon/1', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      done();
    });

    test('500: server error', async done => {
      fetchMock.put('api/pokemon/1', 500);

      try {
        const json = await put('api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.put('api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      try {
        const json = await put('api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at api/pokemon/1 reason: Unexpected token } in JSON at position 2'
        );

        done();
      }
    });
  });

  describe('patch', () => {
    test('200', async done => {
      fetchMock.patch('api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await patch('api/pokemon/1', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      done();
    });

    test('500: server error', async done => {
      fetchMock.patch('api/pokemon/1', 500);

      try {
        const json = await patch('api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.patch('api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      try {
        const json = await patch('api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at api/pokemon/1 reason: Unexpected token } in JSON at position 2'
        );

        done();
      }
    });
  });

  describe('remove', () => {
    test('200', async done => {
      fetchMock.delete('api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      const json = await remove('api/pokemon/1');
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      done();
    });

    test('500: server error', async done => {
      fetchMock.delete('api/pokemon/1', 500);

      try {
        const json = await remove('api/pokemon/1');
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.delete('api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      });

      try {
        const json = await remove('api/pokemon/1');
        fail();
      } catch (e) {
        const fetchOptions = fetchMock.lastOptions();
        expect(fetchOptions.headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at api/pokemon/1 reason: Unexpected token } in JSON at position 2'
        );

        done();
      }
    });
  });
});
