import { expect, describe, it, vi } from 'vitest';
import { emptyPage, mapPage, Page, pageOf } from '../src/spring-models';

type Pokemon = {
  id: number;
  name: string;
  types: string[];
};

type Bicycle = {
  id: number;
  brand: string;
};

/* 
  This test is designed to trip flow, not to actually test any code.
  The emptyPage had a bug where it was not recognized as being a 
  Page<T>.
*/
describe('emptyPage', () => {
  it('should understand that emptyPage is of type Page<T>', () => {
    const pokemonPage: Page<Pokemon> = emptyPage();
    expect(pokemonPage.number).toBe(0);
    expect(pokemonPage.totalPages).toBe(0);
    expect(pokemonPage.first).toBe(true);
    expect(pokemonPage.last).toBe(true);
    expect(pokemonPage.size).toBe(0);
    expect(pokemonPage.numberOfElements).toBe(0);
    expect(pokemonPage.content.length).toBe(0);
  });
});

describe('pageOf', () => {
  it('should create a Page with content', () => {
    const content: Bicycle[] = [{ id: 1, brand: 'Gazelle' }];
    const bicyclePage: Page<Bicycle> = pageOf(content);

    expect(bicyclePage.content.length).toBe(1);
    expect(bicyclePage.totalPages).toBe(1);
    expect(bicyclePage.totalElements).toBe(1);
    expect(bicyclePage.first).toBe(true);
    expect(bicyclePage.last).toBe(true);
    expect(bicyclePage.numberOfElements).toBe(1);
  });

  it('should create a Page of a subset of an array', () => {
    const content: Bicycle[] = [
      { id: 1, brand: 'Gazelle' },
      { id: 2, brand: 'Batavus' },
      { id: 3, brand: 'Cortina' },
      { id: 4, brand: 'Giant' },
      { id: 5, brand: 'Cube' }
    ];
    const bicyclePage: Page<Bicycle> = pageOf(content, 2, 2);

    expect(bicyclePage.content.length).toBe(2);
    expect(bicyclePage.content[0].id).toBe(3);
    expect(bicyclePage.content[1].id).toBe(4);
    expect(bicyclePage.totalPages).toBe(3);
    expect(bicyclePage.totalElements).toBe(5);
    expect(bicyclePage.first).toBe(false);
    expect(bicyclePage.last).toBe(false);
    expect(bicyclePage.numberOfElements).toBe(2);
  });

  it('should work with zero-based pagination', () => {
    const content: Bicycle[] = [
      { id: 1, brand: 'Gazelle' },
      { id: 2, brand: 'Batavus' },
      { id: 3, brand: 'Cortina' },
      { id: 4, brand: 'Giant' },
      { id: 5, brand: 'Cube' }
    ];
    const bicyclePage: Page<Bicycle> = pageOf(content, 2, 2, false);

    expect(bicyclePage.content.length).toBe(1);
    expect(bicyclePage.content[0].id).toBe(5);
    expect(bicyclePage.totalPages).toBe(3);
    expect(bicyclePage.totalElements).toBe(5);
    expect(bicyclePage.first).toBe(false);
    expect(bicyclePage.last).toBe(true);
    expect(bicyclePage.numberOfElements).toBe(1);
  });
});

describe('mapPage', () => {
  it('should use the given mapper to map the content', () => {
    const content = [
      { id: 1, created: '2023-01-01 00:00:00', name: 'Test 1' },
      { id: 1, created: '2023-01-01 00:01:00', name: 'Test 2' }
    ];

    const page = pageOf(content, 1, 2, true);

    const mapper = vi.fn((item: { created: string }) => ({
      ...item,
      created: new Date(item.created)
    }));

    const mappedPage = mapPage(mapper)(page);

    expect(mapper).toHaveBeenCalledTimes(2);
    expect(mappedPage.content[0].created).toEqual(
      new Date('2023-01-01 00:00:00')
    );
    expect(mappedPage.content[1].created).toEqual(
      new Date('2023-01-01 00:01:00')
    );
  });
});
