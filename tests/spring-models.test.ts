import { emptyPage, Page, pageOf } from '../src/spring-models.js';
import { makeResource } from '../src/resource.js';
import { makeInstance } from '../src/utils.js';

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
    expect(bicyclePage.totalPages).toBe(3);
    expect(bicyclePage.totalElements).toBe(5);
    expect(bicyclePage.first).toBe(false);
    expect(bicyclePage.last).toBe(false);
    expect(bicyclePage.numberOfElements).toBe(2);
  });
});
