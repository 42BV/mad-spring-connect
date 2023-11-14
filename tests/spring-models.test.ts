import { emptyPage, mapPage, Page, pageOf } from '../src/spring-models';
import { makeResource } from '../src/resource';
import { makeInstance } from '../src/utils';

class Pokemon extends makeResource<Pokemon>('/api/pokemon') {
  public id!: number;
  public name!: string;
  public types!: string[];
}

class Bicycle extends makeResource<Bicycle>('/api/bicycle') {
  public id!: number;
  public brand!: string;
}

/* 
  This test is designed to trip flow, not to actually test any code.
  The emptyPage had a bug where it was not recognized as being a 
  Page<T>.
*/
describe('emptyPage', () => {
  it('should understand that emptyPage is of type Page<T>', () => {
    const pokemonPage: Page<Pokemon> = emptyPage();
    const bicyclePage: Page<Bicycle> = emptyPage();

    const bicycleContent = emptyPage().content;
    const pokemonContent = emptyPage().content;

    expect(pokemonPage.content.length).toBe(0);
    expect(pokemonContent.length).toBe(0);
    expect(bicyclePage.content.length).toBe(0);
    expect(bicycleContent.length).toBe(0);
  });
});

describe('pageOf', () => {
  it('should create a Page with content', () => {
    const content: Bicycle[] = [
      makeInstance(Bicycle, { id: 1, brand: 'Gazelle' })
    ];
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
      makeInstance(Bicycle, { id: 1, brand: 'Gazelle' }),
      makeInstance(Bicycle, { id: 2, brand: 'Batavus' }),
      makeInstance(Bicycle, { id: 3, brand: 'Cortina' }),
      makeInstance(Bicycle, { id: 4, brand: 'Giant' }),
      makeInstance(Bicycle, { id: 5, brand: 'Cube' })
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
      makeInstance(Bicycle, { id: 1, brand: 'Gazelle' }),
      makeInstance(Bicycle, { id: 2, brand: 'Batavus' }),
      makeInstance(Bicycle, { id: 3, brand: 'Cortina' }),
      makeInstance(Bicycle, { id: 4, brand: 'Giant' }),
      makeInstance(Bicycle, { id: 5, brand: 'Cube' })
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

    const mapper = jest.fn((item) => ({
      ...item,
      created: new Date(item.created)
    }));

    const mappedPage = mapPage(mapper)(page);

    expect(mappedPage.content[0].created).toEqual(
      new Date('2023-01-01 00:00:00')
    );
    expect(mappedPage.content[1].created).toEqual(
      new Date('2023-01-01 00:01:00')
    );
  });
});
