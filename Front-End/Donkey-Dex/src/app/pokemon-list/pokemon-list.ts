import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Pokemon } from '../pokemon';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonDetail } from '../pokemon-detail/pokemon-detail';
import { Router } from '@angular/router';
import { PokemonCollection, CollectedPokemon } from '../pokemon-collection';

@Component({
  selector: 'app-pokemon-list',
  imports: [DecimalPipe, FormsModule, PokemonDetail],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.css',
})
export class PokemonList implements OnInit {
  private pokemonService = inject(Pokemon);
  private collectionService = inject(PokemonCollection);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  searchTerm = '';
  selectedType = 'all';
  collectionMessage = '';
  deleteMessage = '';
  myPokemons: CollectedPokemon[] = [];
  showFavoritesOnly = false;

  pokemons: {
    name: string;
    id?: number;
    image?: string | null;
    isFavorite?: boolean;
    url: string;
    types?: string[];
  }[] = [];

  selectedPokemon: {
    name: string;
    id?: number;
    image?: string | null;
    url: string;
    types?: string[];
  } | null = null;

  loadMyPokemons() {
    this.collectionService.getPokemons().subscribe({
      next: (data) => {
        this.myPokemons = data;
      },
      error: (error) => {
        console.error('Erreur de chargement de Mes Pokémon :', error);
      }
    });
  }


  ngOnInit() {
    this.loadMyPokemons();

    this.pokemonService.getPokemons().subscribe((data) => {
      this.pokemons = data.results;
      this.changeDetector.markForCheck();

      this.pokemons.forEach((pokemonItem) => {
        this.pokemonService
          .getPokemonDetails(pokemonItem.url)
          .subscribe((details) => {
            pokemonItem.id = details.id;
            pokemonItem.image = details.sprites.front_default;
            pokemonItem.types = details.types.map((item) => item.type.name);
            this.changeDetector.markForCheck();
            this.pokemonService.getPokemonSpecies(details.id).subscribe((species) => {
              const frenchName = species.names.find(
                (item) => item.language.name === 'fr'
              );

              if (frenchName) {
                pokemonItem.name = frenchName.name;
              }
            this.changeDetector.markForCheck();
            });
          });
      });

    });
  }

  toggleFavorite(pokemonItem: { isFavorite?: boolean }) {
    pokemonItem.isFavorite = !pokemonItem.isFavorite;
  }

  selectPokemon(pokemonItem: {
    name: string;
    id?: number;
    image?: string | null;
    url: string;
    types?: string[];
  }) {
    if (pokemonItem.id !== undefined) {
    this.router.navigate(['/pokemon', pokemonItem.id]);
    }
  }

  addToCollection(pokemonItem: { name: string; id?: number }) {
    if (pokemonItem.id === undefined) {
      return;
    }

    this.collectionService
      .addPokemon(pokemonItem.id, pokemonItem.name)
      .subscribe({
        next: (response: any) => {
          this.collectionMessage = response.already_exists
            ? `${pokemonItem.name} fait déjà partie de tes Pokémons.`
            : `${pokemonItem.name} a bien été ajouté à tes Pokémons !`;

          this.loadMyPokemons();
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout :", error);
          this.collectionMessage =
            "Impossible d'ajouter le Pokémon. Vérifie le serveur PHP.";
        }
      });
  }

  filteredPokemons() {
    const search = this.searchTerm.toLowerCase().trim();

    return this.pokemons.filter((pokemonItem) => {
      const matchesSearch = pokemonItem.name.toLowerCase().includes(search);

      const matchesType =
        this.selectedType === 'all' ||
        (pokemonItem.types?.includes(this.selectedType) ?? false);

      const matchesFavorite =
        !this.showFavoritesOnly || pokemonItem.isFavorite === true;

      return matchesSearch && matchesType && matchesFavorite;
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
      dark: 'Ténèbres'
    };

    return translations[type] || type;
  }

  removeFromCollection(pokemon: CollectedPokemon) {
    this.collectionService.deletePokemon(pokemon.id).subscribe({
      next: () => {
        this.myPokemons = this.myPokemons.filter(
          (item) => item.id !== pokemon.id
        );
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.deleteMessage = `Impossible de supprimer ${pokemon.name}. Réessaie.`;

        this.changeDetector.markForCheck();
      }
    });
  }
}
