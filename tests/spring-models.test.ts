import { emptyPage, Page } from '../src/spring-models';
import { makeResource } from '../src/resource';

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
