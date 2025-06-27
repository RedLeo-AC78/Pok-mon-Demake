"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Slot, { SlotProps } from "./Slot";

export type PokeInfo = {
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
};

interface Save {
  id: number;
  name: string;
  x: number;
  y: number;
  team: string[];
}

export default function CreaPage() {
  const searchParams = useSearchParams();
  const isLoad = searchParams.get("load") === "true";

  // — États création
  const [name, setName] = useState("");
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [poke1, setPoke1] = useState<PokeInfo | null>(null);
  const [poke2, setPoke2] = useState<PokeInfo | null>(null);

  // — Liste Pokémon (Gen 1–3)
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const lists = await Promise.all(
        [1, 2, 3].map(async (g) => {
          const res = await fetch(`https://pokeapi.co/api/v2/generation/${g}`);
          const json = await res.json();
          return json.pokemon_species.map((s: any) => s.name);
        })
      );
      setPokemonList(lists.flat().sort());
    })();
  }, []);

  // — Chargement dynamique des sprites
  useEffect(() => {
    if (!slot1) return setPoke1(null);
    fetch(`https://pokeapi.co/api/v2/pokemon/${slot1}`)
      .then((r) => r.json())
      .then((j: PokeInfo) => setPoke1(j))
      .catch(() => setPoke1(null));
  }, [slot1]);

  useEffect(() => {
    if (!slot2) return setPoke2(null);
    fetch(`https://pokeapi.co/api/v2/pokemon/${slot2}`)
      .then((r) => r.json())
      .then((j: PokeInfo) => setPoke2(j))
      .catch(() => setPoke2(null));
  }, [slot2]);

  // — Musique de fond
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  // — Sauvegarde / Chargement
  const handleStart = () => {
    const state = { name, team: [slot1, slot2], x: 3, y: 10 };
    localStorage.setItem("gameState", JSON.stringify(state));
    window.location.href = "/game";
  };

  const handleLoad = async (id: number) => {
    const res = await fetch(`/api/load?id=${id}`);
    const data: Save = await res.json();
    localStorage.setItem("gameState", JSON.stringify(data));
    window.location.href = "/game";
  };

  // — Chargement des saves si besoin
  const [saves, setSaves] = useState<Save[]>([]);
  useEffect(() => {
    if (!isLoad) return;
    (async () => {
      const res = await fetch("/api/saves");
      setSaves(await res.json());
    })();
  }, [isLoad]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <audio ref={audioRef} src="/audio/Character_creation.mp3" loop />

      <img
        src="/images/Hero.png"
        alt="Fond création"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      <div
        className="relative z-10 max-w-4xl mx-auto mt-12 p-8 bg-black border-2 border-yellow-400 rounded-lg"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        {isLoad ? (
          <>
            <h1 className="text-2xl text-yellow-400 mb-6 text-center">
              Charger une sauvegarde
            </h1>
            <div className="space-y-2">
              {saves.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLoad(s.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Sauvegarde {s.id} – Nom : {s.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl text-yellow-400 mb-6 text-center">
              Création du Personnage
            </h1>

            <label className="block text-white mb-4">
              <span className="block mb-1">Nom du Dresseur :</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-200 bg-opacity-80 text-gray-900"
              />
            </label>

            <p className="text-white mb-4">
              Choisissez votre équipe (2 Pokémon) :
            </p>

            <div className="grid grid-cols-2 gap-6">
              <Slot
                slotNumber={1}
                value={slot1}
                updateSlot={(val, slot) => setSlot1(val)}
                poke={poke1}
                pokemonList={pokemonList}
              />
              <Slot
                slotNumber={2}
                value={slot2}
                updateSlot={(val, slot) => setSlot2(val)}
                poke={poke2}
                pokemonList={pokemonList}
              />
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={handleStart}
                disabled={!name || !slot1 || !slot2}
                className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 transition"
              >
                Commencer l’Aventure
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
