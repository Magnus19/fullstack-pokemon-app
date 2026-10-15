import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pokemon, PokemonRecord } from '../pokemon';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-pokemon-form',
  host: { class: 'block' },
  templateUrl: './pokemon-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PokemonForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly pokemonService = inject(Pokemon);
  readonly editingId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly deletingId = signal<string | null>(null);

  readonly pokemonForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    level: [1, [Validators.required, Validators.min(1)]],
    nature: ['', Validators.required],
  });

  ngOnInit() {
    this.loadPokemon();
  }

  startEdit(pokemon: PokemonRecord) {
    this.editingId.set(pokemon._id);
    this.errorMessage.set('');
    this.pokemonForm.patchValue(pokemon);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.pokemonForm.reset();
    this.errorMessage.set('');
  }

  deletePokemon(pokemon: PokemonRecord) {
    if (!window.confirm(`Release ${pokemon.name} from your team?`)) return;

    this.deletingId.set(pokemon._id);
    this.errorMessage.set('');
    this.pokemonService.deletePokemon(pokemon._id).subscribe({
      next: () => {
        this.loadPokemon();
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not release this Pokémon. Please try again.');
        this.deletingId.set(null);
      },
    });
  }

  onSubmit() {
    if (this.pokemonForm.invalid) {
      this.pokemonForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    const data = this.pokemonForm.getRawValue();
    const id = this.editingId();
    const request = id
      ? this.pokemonService.updatePokemon(id, data)
      : this.pokemonService.savePokemon(data);

    request.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadPokemon();
      },
      error: () => {
        this.errorMessage.set(`Could not ${id ? 'update' : 'save'} this Pokémon. Please try again.`);
      },
    });
  }

  private loadPokemon() {
    this.pokemonService.fetchPokemon().subscribe({
      error: () => this.errorMessage.set('Could not load Pokémon. Check that the server is running.'),
    });
  }
}
