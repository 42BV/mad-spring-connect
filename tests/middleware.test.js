
import { 
  checkStatus,
  parseJSON
} from '../src/middleware';

describe('checkStatus', () => {
  const check2xx = (status) => (done) => {
    const promise = checkStatus(Promise.resolve({ status }));

    promise.then((response) => {
      expect(response).toEqual({ status });
      done();
    }).catch(() => {
      fail();
    });
  };

  test('200', check2xx(200));
  test('299', check2xx(299));

  const checkNon2xx = (status) => (done) => {
    const promise = checkStatus(Promise.resolve({ status, statusText: 'WError' }));

    promise.then((response) => {
      fail();
    }).catch((error) => {
      expect(error.message).toBe('WError');
      expect(error.response).toEqual({ status, statusText: 'WError' });
      done();
    });
  };

  test('100', checkNon2xx(100));
  test('199', checkNon2xx(199));
  test('300', checkNon2xx(300));
  test('500', checkNon2xx(500));
});

test('parseJSON', (done) => {
  const jsonSpy = jest.fn(() => 42);

  const promise = parseJSON(Promise.resolve({ json: jsonSpy }));

  promise.then((number) => {
    expect(number).toBe(42);

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    done();
  }).catch(() => {
    fail();
  });
});