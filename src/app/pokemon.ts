import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface PokemonInput {
    name: string;
    type: string;
    level: number;
    nature: string;
}

export interface PokemonRecord extends PokemonInput {
    _id: string;
}

@Injectable({
    providedIn: 'root'
})

export class Pokemon {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/pokemon';

    pokemonList = signal<PokemonRecord[]>([]);

    fetchPokemon(): Observable<PokemonRecord[]> {
        return this.http.get<PokemonRecord[]>(this.apiUrl).pipe(
            tap(data => this.pokemonList.set(data)),
        );
    }

    savePokemon(data: PokemonInput): Observable<PokemonRecord> {
        return this.http.post<PokemonRecord>(this.apiUrl, data);
    }

    updatePokemon(id: string, data: PokemonInput): Observable<PokemonRecord> {
        return this.http.put<PokemonRecord>(`${this.apiUrl}/${id}`, data);
    }

    deletePokemon(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
