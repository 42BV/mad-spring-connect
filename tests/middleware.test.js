import 'isomorphic-fetch';

import { checkStatus, parseJSON } from '../src/middleware';

describe('checkStatus', () => {
  const check2xx = status => done => {
    const response = new Response(`{ "number": 42 }`, { status });
    const promise = checkStatus(Promise.resolve(response));

    promise
      .then(response => {
        expect(response).toBe(response);
        done();
      })
      .catch(() => {
        fail();
      });
  };

  test('200', check2xx(200));
  test('299', check2xx(299));

  const checkNon2xx = status => done => {
    const response = new Response(`{ "number": 42 }`, {
      status,
      statusText: 'Werror'
    });
    const promise = checkStatus(Promise.resolve(response));

    promise
      .then(response => {
        fail();
      })
      .catch(error => {
        expect(error.message).toBe('Werror');
        expect(error.response).toBe(response);
        done();
      });
  };

  test('100', checkNon2xx(100));
  test('199', checkNon2xx(199));
  test('300', checkNon2xx(300));
  test('500', checkNon2xx(500));
});

describe('parseJSON', () => {
  test('200 with Content-Type application/json', done => {
    const headers = new Headers({
      'Content-Length': 42,
      'Content-Type': 'application/json;charset=UTF-8'
    });
    const response = new Response(`{ "number": 42 }`, { status: 200, headers });

    const promise = parseJSON(Promise.resolve(response));

    promise
      .then(json => {
        expect(json.number).toBe(42);

        done();
      })
      .catch(() => {
        fail();
      });
  });

  test('200 with Content-Type application/vnd.spring-boot.actuator.v1+json', done => {
    const headers = new Headers({
      'Content-Length': 42,
      'Content-Type': 'application/vnd.spring-boot.actuator.v1+json;charset=UTF-8'
    });
    const response = new Response(`{ "number": 42 }`, { status: 200, headers });

    const promise = parseJSON(Promise.resolve(response));

    promise
      .then(json => {
        expect(json.number).toBe(42);

        done();
      })
      .catch(() => {
        fail();
      });
  });

  test('200 without Content-Type application/json', done => {
    const headers = new Headers({
      'Content-Length': 42,
      'Content-Type': 'text/html;charset=UTF-8'
    });
    const response = new Response(`{ "number": 42 }`, { status: 200, headers });

    const promise = parseJSON(Promise.resolve(response));

    promise
      .then(() => {
        fail();
      })
      .catch(e => {
        expect(e.message).toBe(
          'mad-spring-connect: Content-Type is not json, will not parse.'
        );
        done();
      });
  });

  test('200 without Content-Type', done => {
    const headers = new Headers({ 'Content-Length': 42 });
    const response = new Response(`{ "number": 42 }`, { status: 200, headers });

    const promise = parseJSON(Promise.resolve(response));

    promise
      .then(() => {
        fail();
      })
      .catch(e => {
        expect(e.message).toBe(
          'mad-spring-connect: Content-Type is not json, will not parse.'
        );
        done();
      });
  });

  test('204', done => {
    const headers = new Headers({ 'Content-Length': 42 });
    const response = new Response(`{ "number": 42 }`, { status: 204, headers });

    const promise = parseJSON(Promise.resolve(response));

    promise
      .then(json => {
        expect(json).toEqual({});

        done();
      })
      .catch(() => {
        fail();
      });
  });
});
