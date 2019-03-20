import { makeInstance } from '../src/utils';

class Person {
  public id?: number;
  public name?: string;
}

test('makeInstance', () => {
  const person = makeInstance(Person, { id: 10, name: 'Maarten Hus' });

  expect(person instanceof Person).toBe(true);
  expect(person.id).toBe(10);
  expect(person.name).toBe('Maarten Hus');
});
