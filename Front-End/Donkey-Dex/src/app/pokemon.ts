import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

type EvolutionNode = {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
};

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private http = inject(HttpClient);

  getPokemons() {
    return this.http.get<{ results: { name: string; url: string }[] }>(this.apiUrl);
  }

  getPokemonDetails(url: string) {
  return this.http.get<{
    types: { type: { name: string } }[];
    id: number;
    name: string;
    sprites: { front_default: string | null }
    stats: {
    base_stat: number;
    stat: { name: string };
  }[];
  }>(url);
  }

  getPokemonSpecies(id: number) {
  return this.http.get<{
    names: {
      name: string;
      language: { name: string };
    }[];
    evolution_chain: {
    url: string;
    };
  }>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  }

  getEvolutionChain(url: string) {
  return this.http.get<{ chain: EvolutionNode }>(url);
  }

}
