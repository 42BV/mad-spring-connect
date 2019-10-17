import fetchMock from 'fetch-mock';

import * as middleware from '../src/middleware';
import { configureMadConnect } from '../src/config';
import { get, post, put, patch, remove } from '../src/request';

// Note that we tests all the requests with the default middleware
describe('requests', () => {
  beforeEach(() => {
    // @ts-ignore
    middleware.checkStatus = jest.fn(middleware.checkStatus);

    // @ts-ignore
    middleware.parseJSON = jest.fn(middleware.parseJSON);

    configureMadConnect({
      fetch: undefined,
      middleware: [middleware.checkStatus, middleware.parseJSON],
    });
  });

  afterEach(() => {
    expect(middleware.checkStatus).toHaveBeenCalledTimes(1);
    expect(middleware.parseJSON).toHaveBeenCalledTimes(1);
    fetchMock.restore();
  });

  describe('get', () => {
    test('200: without query parameters', async done => {
      fetchMock.get('/api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      const json = await get('/api/pokemon/1');
      expect(json).toEqual({ id: 1 });
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon/1',
        method: 'GET',
        options: undefined,
      });

      done();
    });

    test('200: with query parameters', async done => {
      const options = {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.get('/api/pokemon?page=1', options);

      const json = await get('/api/pokemon', { page: 1 });
      expect(json).toEqual({ id: 1 });
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon',
        method: 'GET',
        queryParams: {
          page: 1,
        },
      });

      done();
    });

    test('500: server error', async done => {
      fetchMock.get('/api/pokemon?page=1', 500);

      const options = { page: 1 };
      try {
        await get('/api/pokemon', options);
        fail();
      } catch (e) {
        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon',
          method: 'GET',
          queryParams: {
            page: 1,
          },
        });

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.get('/api/pokemon?page=1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      const options = { page: 1 };
      try {
        await get('/api/pokemon', options);
        fail();
      } catch (e) {
        expect(e.message).toBe(
          'invalid json response body at /api/pokemon?page=1 reason: Unexpected token } in JSON at position 2',
        );
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon',
          method: 'GET',
          queryParams: {
            page: 1,
          },
        });

        done();
      }
    });
  });

  describe('post', () => {
    test('200', async done => {
      const options = {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.post('/api/pokemon', options);

      const json = await post('/api/pokemon', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      // @ts-ignore
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon',
        method: 'POST',
        payload: {
          name: 'bulbasaur',
        },
      });

      done();
    });

    test('500: server error', async done => {
      fetchMock.post('/api/pokemon', 500);

      const payload = { name: 'bulbasaur' };
      try {
        await post('/api/pokemon', payload);
        fail();
      } catch (e) {
        // @ts-ignore
        const { headers, body } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon',
          method: 'POST',
          payload,
        });

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.post('/api/pokemon', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      try {
        await post('/api/pokemon', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        // @ts-ignore
        const { headers, body } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at /api/pokemon reason: Unexpected token } in JSON at position 2',
        );
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon',
          method: 'POST',
          payload: { name: 'bulbasaur' },
        });

        done();
      }
    });

    test('200: custom payload', async done => {
      const options = {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.post('/api/pokemon', options);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json',
      });
      payload.append('pokemon', blob);

      const json = await post('/api/pokemon', payload);
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.headers).toBe(undefined);
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon',
        method: 'POST',
        payload,
      });

      // @ts-ignore
      for (let entry of fetchOptions.body.entries()) {
        const [key, value] = entry;

        expect(key).toBe('pokemon');

        const reader = new FileReader();
        reader.onload = function() {
          expect(reader.result).toBe(`{"name":"bulbasaur"}`);
          done();
        };
        reader.readAsText(value);
      }
    });
  });

  describe('put', () => {
    test('200', async done => {
      fetchMock.put('/api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      const json = await put('/api/pokemon/1', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      // @ts-ignore
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon/1',
        method: 'PUT',
        payload: { name: 'bulbasaur' },
      });

      done();
    });

    test('500: server error', async done => {
      fetchMock.put('/api/pokemon/1', 500);

      try {
        await put('/api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        // @ts-ignore
        const { body, headers } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'PUT',
          payload: { name: 'bulbasaur' },
        });

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.put('/api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      try {
        await put('/api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        // @ts-ignore
        const { body, headers } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at /api/pokemon/1 reason: Unexpected token } in JSON at position 2',
        );
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'PUT',
          payload: { name: 'bulbasaur' },
        });

        done();
      }
    });

    test('200: custom payload', async done => {
      const options = {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.put('/api/pokemon', options);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json',
      });
      payload.append('pokemon', blob);

      const json = await put('/api/pokemon', payload);
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.headers).toBe(undefined);
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon',
        method: 'PUT',
        payload,
      });

      // @ts-ignore
      for (let entry of fetchOptions.body.entries()) {
        const [key, value] = entry;

        expect(key).toBe('pokemon');

        const reader = new FileReader();
        reader.onload = function() {
          expect(reader.result).toBe(`{"name":"bulbasaur"}`);
          done();
        };
        reader.readAsText(value);
      }
    });
  });

  describe('patch', () => {
    test('200', async done => {
      fetchMock.patch('/api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      const json = await patch('/api/pokemon/1', { name: 'bulbasaur' });
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.body).toBe(`{"name":"bulbasaur"}`);
      // @ts-ignore
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon/1',
        method: 'PATCH',
        payload: { name: 'bulbasaur' },
      });

      done();
    });

    test('500: server error', async done => {
      fetchMock.patch('/api/pokemon/1', 500);

      try {
        await patch('/api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        // @ts-ignore
        const { body, headers } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'PATCH',
          payload: { name: 'bulbasaur' },
        });

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.patch('/api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      try {
        await patch('/api/pokemon/1', { name: 'bulbasaur' });
        fail();
      } catch (e) {
        // @ts-ignore
        const { body, headers } = fetchMock.lastOptions();

        expect(body).toBe(`{"name":"bulbasaur"}`);
        expect(headers['Content-Type']).toBe('application/json');

        expect(e.message).toBe(
          'invalid json response body at /api/pokemon/1 reason: Unexpected token } in JSON at position 2',
        );
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'PATCH',
          payload: { name: 'bulbasaur' },
        });

        done();
      }
    });

    test('200: custom payload', async done => {
      const options = {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      };
      fetchMock.patch('/api/pokemon', options);

      const payload = new FormData();

      const blob = new Blob([JSON.stringify({ name: 'bulbasaur' })], {
        type: 'application/json',
      });
      payload.append('pokemon', blob);

      const json = await patch('/api/pokemon', payload);
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.headers).toBe(undefined);
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon',
        method: 'PATCH',
        payload,
      });

      // @ts-ignore
      for (let entry of fetchOptions.body.entries()) {
        const [key, value] = entry;

        expect(key).toBe('pokemon');

        const reader = new FileReader();
        reader.onload = function() {
          expect(reader.result).toBe(`{"name":"bulbasaur"}`);
          done();
        };
        reader.readAsText(value);
      }
    });
  });

  describe('remove', () => {
    test('200', async done => {
      fetchMock.delete('/api/pokemon/1', {
        body: { id: 1 },
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      const json = await remove('/api/pokemon/1');
      expect(json).toEqual({ id: 1 });

      const fetchOptions = fetchMock.lastOptions();
      // @ts-ignore
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
        url: '/api/pokemon/1',
        method: 'DELETE',
        payload: undefined,
      });

      done();
    });

    test('500: server error', async done => {
      fetchMock.delete('/api/pokemon/1', 500);

      try {
        await remove('/api/pokemon/1');
        fail();
      } catch (e) {
        // @ts-ignore
        const { headers } = fetchMock.lastOptions();

        expect(headers['Content-Type']).toBe('application/json');
        expect(e.message).toBe('Internal Server Error');
        expect(e.response).not.toBe(undefined);
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'DELETE',
          payload: undefined,
        });

        done();
      }
    });

    test('200: parse error', async done => {
      fetchMock.delete('/api/pokemon/1', {
        body: '[]}{}]',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      });

      try {
        await remove('/api/pokemon/1');
        fail();
      } catch (e) {
        // @ts-ignore
        const { headers } = fetchMock.lastOptions();

        expect(headers['Content-Type']).toBe('application/json');
        expect(e.message).toBe(
          'invalid json response body at /api/pokemon/1 reason: Unexpected token } in JSON at position 2',
        );
        expect(middleware.parseJSON).toHaveBeenCalledWith(expect.any(Promise), {
          url: '/api/pokemon/1',
          method: 'DELETE',
          payload: undefined,
        });

        done();
      }
    });
  });
});
