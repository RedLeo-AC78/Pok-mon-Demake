"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Slot from "./Slot";

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

  // --- États création ---
  const [name, setName] = useState("");
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");

  // --- États chargement ---
  const [saves, setSaves] = useState<Save[]>([]);
  const [loading, setLoading] = useState(false);

  function updateSlot(target: string, slotNumber: number) {
    if (slotNumber == 1) {
      setSlot1(target);
    } else {
      setSlot2(target);
    }
  }

  // Charger la liste des Pokémon Gen1–3 pour l’autocomplete
  useEffect(() => {
    (async () => {
      const gens = await Promise.all(
        [1, 2, 3].map(async (g) => {
          const res = await fetch(`https://pokeapi.co/api/v2/generation/${g}`);
          const json = await res.json();
          return json.pokemon_species.map((s: any) => s.name);
        })
      );
      setPokemonList(gens.flat().sort());
    })();
  }, []);

  // Si on est en mode "load", récupérer les saves
  useEffect(() => {
    if (!isLoad) return;
    (async () => {
      const res = await fetch("/api/saves");
      const data: Save[] = await res.json();
      setSaves(data);
    })();
  }, [isLoad]);

  // Création d’une nouvelle partie
  const handleStart = () => {
    const state = {
      name,
      team: [slot1, slot2],
      x: 3,
      y: 10,
    };
    localStorage.setItem("gameState", JSON.stringify(state));
    window.location.href = "/game";
  };

  // Chargement d’une partie existante
  const handleLoad = async (id: number) => {
    setLoading(true);
    const res = await fetch(`/api/load?id=${id}`);
    const data = await res.json();
    localStorage.setItem("gameState", JSON.stringify(data));
    window.location.href = "/game";
  };

  return (
    <div className="w-screen h-screen bg-gray-800 flex flex-col items-center justify-center text-white p-4 space-y-6">
      {isLoad ? (
        <>
          <h1 className="text-3xl">Charger une sauvegarde</h1>
          {loading && <p>Chargement…</p>}
          <div className="space-y-2">
            {saves.map((s) => (
              <button
                key={s.id}
                className="w-64 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
                onClick={() => handleLoad(s.id)}
              >
                Sauvegarde {s.id} – Nom : {s.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl">Création de personnage</h1>
          <input
            className="w-64 px-3 py-2 text-black rounded"
            placeholder="Nom du personnage"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex space-x-4">
            <Slot slotNumber={1} updateSlot={updateSlot} />
            <Slot slotNumber={2} updateSlot={updateSlot} />
            {/* 
            <div>
              <label>Pokémon slot 2</label>
              <input
                list="pokemon-list"
                className="w-32 px-2 py-1 text-black rounded"
                placeholder="Rechercher…"
                value={slot2}
                onChange={(e) => setSlot2(e.target.value)}
              />
            </div> */}
          </div>

          <datalist id="pokemon-list">
            {pokemonList.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <button
            className="mt-4 px-6 py-2 bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50"
            disabled={!name || !slot1 || !slot2}
            onClick={handleStart}
          >
            Start
          </button>
        </>
      )}
    </div>
  );
}
