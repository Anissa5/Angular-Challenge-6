import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CollectedPokemon {
  id: number;
  pokemon_api_id: number;
  name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonCollection {
  private http = inject(HttpClient);

  getPokemons() {
    return this.http.get<CollectedPokemon[]>(
      'http://localhost:8000/pokemons.php'
    );
  }

  addPokemon(pokemon_api_id: number, name: string) {
    return this.http.post('http://localhost:8000/add-pokemon.php', {
      pokemon_api_id: pokemon_api_id,
      name: name
    });
  }

  deletePokemon(id: number) {
    return this.http.delete('http://localhost:8000/delete-pokemon.php', {
      body: { id: id }
    });
  }
}
