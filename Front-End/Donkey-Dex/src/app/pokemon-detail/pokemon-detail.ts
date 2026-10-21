import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pokemon } from '../pokemon';
import { forkJoin } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  imports: [NgClass, RouterLink],
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.css',
})
export class PokemonDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(Pokemon);
  private cdr = inject(ChangeDetectorRef);

  pokemon: {
    name: string;
    id: number;
    image: string | null;
    types: string[];
    stats: { name: string; value: number }[];
  } | null = null;
    evolutions: { name: string; id: number; image: string }[] = [];

  ngOnInit() {
  this.route.paramMap.subscribe((params) => {
    const id = Number(params.get('id'));

    if (!id) {
      return;
    }

    const url = `${this.pokemonService.apiUrl}/${id}`;

    this.pokemonService.getPokemonDetails(url).subscribe({
      next: (details) => {
        this.pokemon = {
          name: details.name,
          id: details.id,
          image: details.sprites.front_default,
          types: details.types.map((item) => item.type.name),
          stats: details.stats.map((item) => ({
            name: item.stat.name,
            value: item.base_stat,
          })),
        };

        this.cdr.markForCheck();

        this.pokemonService
          .getPokemonSpecies(details.id)
          .subscribe((species) => {
            const frenchName = species.names.find(
              (item) => item.language.name === 'fr'
            );

            if (frenchName && this.pokemon) {
              this.pokemon.name = frenchName.name;
              this.cdr.markForCheck();
            }

            // Récupérer la chaîne d'évolution
            this.pokemonService
              .getEvolutionChain(species.evolution_chain.url)
              .subscribe((evolutionData) => {
                const evolutionIds: number[] = [];

                const collectIds = (
                  node: typeof evolutionData.chain
                ): void => {
                  const speciesId = Number(
                    node.species.url.split('/').filter(Boolean).pop()
                  );

                  evolutionIds.push(speciesId);
                  node.evolves_to.forEach(collectIds);
                };

                collectIds(evolutionData.chain);

                forkJoin(
                  evolutionIds.map((speciesId) =>
                    this.pokemonService.getPokemonSpecies(speciesId)
                  )
                ).subscribe((speciesList) => {
                  this.evolutions = speciesList.map((item, index) => {
  const frenchEvolutionName = item.names.find(
    (name) => name.language.name === 'fr'
  );

  return {
    name: frenchEvolutionName?.name ?? '',
    id: evolutionIds[index],
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolutionIds[index]}.png`,
  };
});

                  this.cdr.markForCheck();
                });
              });
          });
      },
      error: (error) => {
        console.error('Erreur de chargement du Pokémon :', error);
      },
    });
  });
}

translateType(type: string): string {
  const translations: { [key: string]: string } = {
    grass: 'Plante',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Électrik',
    poison: 'Poison',
    normal: 'Normal',
    flying: 'Vol',
    bug: 'Insecte',
    ground: 'Sol',
    fairy: 'Fée',
    fighting: 'Combat',
    psychic: 'Psy',
    rock: 'Roche',
    steel: 'Acier',
    ice: 'Glace',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Ténèbres',
  };

  return translations[type] || type;
}

translateStat(name: string): string {
  const translations: { [key: string]: string } = {
    hp: 'PV',
    attack: 'Attaque',
    defense: 'Défense',
    'special-attack': 'Attaque spéciale',
    'special-defense': 'Défense spéciale',
    speed: 'Vitesse',
  };

  return translations[name] || name;
}
}
