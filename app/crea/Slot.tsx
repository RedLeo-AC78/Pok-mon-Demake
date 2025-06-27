"use client";

import React from "react";
import { PokeInfo } from "./page";

export interface SlotProps {
  slotNumber: number;
  value: string;
  updateSlot: (value: string, slot: number) => void;
  poke: PokeInfo | null;
  pokemonList: string[];
}

export default function Slot({
  slotNumber,
  value,
  updateSlot,
  poke,
  pokemonList,
}: SlotProps) {
  return (
    <div className="p-4 bg-gray-800 bg-opacity-50 rounded">
      <h2 className="text-white mb-2">Pokémon {slotNumber}</h2>

      <div className="flex flex-col items-center bg-gray-700 bg-opacity-75 p-4 rounded mb-3">
        {poke ? (
          <>
            <img
              src={poke.sprites.front_default}
              alt={poke.name}
              className="w-24 h-24 mb-2"
            />
            <span className="text-white font-semibold">
              {poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}
            </span>
            <span className="text-gray-300 text-sm">
              Types: {poke.types.map((t) => t.type.name).join(", ")}
            </span>
          </>
        ) : (
          <div className="w-24 h-24 bg-gray-600 bg-opacity-50 mb-2 rounded" />
        )}
      </div>

      <input
        type="text"
        list="pokemon-list"
        placeholder="Rechercher…"
        value={value}
        onChange={(e) => updateSlot(e.target.value.toLowerCase(), slotNumber)}
        className="w-full px-3 py-2 rounded bg-gray-200 bg-opacity-80 text-gray-900"
      />

      <datalist id="pokemon-list">
        {pokemonList.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
