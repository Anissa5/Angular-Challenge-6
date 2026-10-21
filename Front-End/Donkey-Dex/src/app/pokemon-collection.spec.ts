import { TestBed } from '@angular/core/testing';

import { PokemonCollection } from './pokemon-collection';

describe('PokemonCollection', () => {
  let service: PokemonCollection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCollection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
