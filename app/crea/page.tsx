"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

type PokeInfo = {
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
};

export default function CreaPage() {
  const searchParams = useSearchParams();
  const isLoad = searchParams.get("load") === "true";

  // — État du dresseur & slots
  const [name, setName] = useState("");
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [poke1, setPoke1] = useState<PokeInfo | null>(null);
  const [poke2, setPoke2] = useState<PokeInfo | null>(null);

  // — Liste pour l'autocomplete (Gen1–3)
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const lists = await Promise.all(
        [1, 2, 3].map((g) =>
          fetch(`https://pokeapi.co/api/v2/generation/${g}`)
            .then((r) => r.json())
            .then((j) => j.pokemon_species.map((s: any) => s.name))
        )
      );
      setPokemonList(lists.flat().sort());
    })();
  }, []);

  // — Quand slot1 change, fetch PokeAPI
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

  // — Musique de création
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  // — Handlers
  const handleStart = () => {
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        name,
        team: [slot1, slot2],
        x: 3,
        y: 10,
      })
    );
    window.location.href = "/game";
  };

  const handleLoad = async (id: number) => {
    const res = await fetch(`/api/load?id=${id}`);
    const data = await res.json();
    localStorage.setItem("gameState", JSON.stringify(data));
    window.location.href = "/game";
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Musique */}
      <audio ref={audioRef} src="/audio/Character_creation.mp3" loop />

      {/* Fond d'écran */}
      <img
        src="/images/Hero.png"
        alt="Fond création"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* Conteneur central */}
      <div
        className="relative z-10 max-w-4xl mx-auto mt-12 p-8 bg-black bg-opacity-60 border-2 border-yellow-400 rounded-lg"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      >
        <h1 className="text-2xl text-yellow-400 mb-6 text-center">
          Création du Personnage
        </h1>
        {/* Nom */}
        <label className="block text-white mb-4">
          <span className="block mb-1">Nom du Dresseur :</span>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-gray-200 bg-opacity-80 text-gray-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <p className="text-white mb-4">
          Choisissez votre équipe (2 Pokémon max) :
        </p>
        {/* Slots */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { slot: 1, value: slot1, setValue: setSlot1, poke: poke1 },
            { slot: 2, value: slot2, setValue: setSlot2, poke: poke2 },
          ].map(({ slot, value, setValue, poke }) => (
            <div key={slot} className="p-4 bg-gray-800 bg-opacity-50 rounded">
              {/* Titre */}
              <h2 className="text-white mb-2">Pokémon {slot}</h2>

              {/* Carte */}
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

              {/* Input avec autocomplete */}
              <input
                type="text"
                list="pokemon-list"
                placeholder={`Sélectionner`}
                className="w-full px-3 py-2 rounded bg-gray-200 bg-opacity-80 text-gray-900"
                value={value}
                onChange={(e) => setValue(e.target.value.toLowerCase())}
              />
            </div>
          ))}
        </div>
        {/* DataList */}
        <datalist id="pokemon-list">
          {pokemonList.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        {/* Bouton */}
        <div className="mt-6 text-right">
          <button
            onClick={handleStart}
            disabled={!name || !slot1 || !slot2}
            className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 transition"
          >
            Commencer l’Aventure
          </button>
        </div>
      </div>
    </div>
  );
}
