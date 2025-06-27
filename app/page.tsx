"use client";

import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const [fadeOverlay, setFadeOverlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const startNewGame = () => {
    // Affiche l'overlay noir qui passe de opacity 0 → 100%
    setFadeOverlay(true);

    // Fade audio
    if (audioRef.current) {
      const audio = audioRef.current;
      const fadeAudio = setInterval(() => {
        if (audio.volume > 0.1) audio.volume = Math.max(0, audio.volume - 0.1);
        else {
          audio.pause();
          clearInterval(fadeAudio);
        }
      }, 100);
    }

    // Après 1s de fondu, redirige
    setTimeout(() => (window.location.href = "/intro"), 1000);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Musique de menu */}
      <audio ref={audioRef} src="/audio/MainTitle.mp3" loop />

      {/* Image de fond */}
      <img
        src="/images/Background.png"
        alt="Écran titre"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Contenu centré (titre + boutons) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-6xl text-white mb-8 drop-shadow-lg">
          Pokémon Colosseum DEMAKE
        </h1>
        <div className="space-y-4">
          <button
            onClick={startNewGame}
            className="px-8 py-4 bg-blue-600 text-white text-xl rounded hover:bg-blue-700 transition"
          >
            Nouveau jeu
          </button>
          <button
            onClick={() => (window.location.href = "/crea?load=true")}
            className="px-8 py-4 bg-gray-600 text-white text-xl rounded hover:bg-gray-700 transition"
          >
            Charger
          </button>
        </div>
      </div>

      {/* Overlay de fondu */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
          fadeOverlay ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
