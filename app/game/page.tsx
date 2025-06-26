"use client";

import { useState, useEffect } from "react";

type Level = {
  width: number;
  height: number;
  npcs: { id: string; x: number; y: number; dialog: string }[];
  exitLineY: number;
};

type GameState = {
  name: string;
  team: string[];
  x: number;
  y: number;
  hasChallengedBilly?: boolean;
};

export default function GamePage() {
  const [level, setLevel] = useState<Level | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [tileSize, setTileSize] = useState(32);

  // Chargement carte + état
  useEffect(() => {
    Promise.all([
      fetch("/levels/station.json").then((r) => r.json()),
      Promise.resolve(JSON.parse(localStorage.getItem("gameState") || "null")),
    ]).then(([lvl, savedState]) => {
      setLevel(lvl);
      setState({ ...savedState, hasChallengedBilly: false });
    });
  }, []);

  // Calcul dynamique de tileSize
  useEffect(() => {
    if (!level) return;
    const handleResize = () => {
      const maxW = window.innerWidth / level.width;
      const maxH = window.innerHeight / level.height;
      setTileSize(Math.floor(Math.min(maxW, maxH)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [level]);

  // Gestion des touches
  useEffect(() => {
    if (!level || !state) return;

    const handleKey = (e: KeyboardEvent) => {
      let nx = state.x;
      let ny = state.y;

      switch (e.key) {
        case "ArrowUp":
          ny--;
          break;
        case "ArrowDown":
          ny++;
          break;
        case "ArrowLeft":
          nx--;
          break;
        case "ArrowRight":
          nx++;
          break;
        case "p":
        case "P":
          // Sauvegarde
          fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state),
          }).then(() => alert("Partie sauvegardée"));
          return;
        case " ":
          // Interaction PNJ
          const npc = level.npcs.find(
            (n) => Math.abs(n.x - state.x) + Math.abs(n.y - state.y) === 1
          );
          if (npc?.id === "billy") {
            setState((s) => s && { ...s, hasChallengedBilly: true });
            alert("Billy : Hé toi, je te défie !");
          } else if (npc) {
            alert(`Dialogue ${npc.id}`);
          }
          return;
        default:
          return;
      }

      // Vérifier limites
      if (nx < 0 || ny < 0 || nx >= level.width || ny >= level.height) return;

      // Si sorti dehors après défi, lancer combat
      if (ny < level.exitLineY && state.hasChallengedBilly) {
        window.location.href = "/battle";
        return;
      }

      // Mettre à jour position
      setState((s) => s && { ...s, x: nx, y: ny });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [level, state]);

  if (!level || !state) return <div>Chargement…</div>;

  const mapW = level.width * tileSize;
  const mapH = level.height * tileSize;

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      <div className="relative" style={{ width: mapW, height: mapH }}>
        {/* Fond de carte */}
        <img
          src="/images/station_service_intérieur.png"
          alt="Station Service"
          className="absolute top-0 left-0 w-full h-full"
        />

        {/* Joueur */}
        <div
          className="absolute bg-blue-500"
          style={{
            width: tileSize * 0.8,
            height: tileSize * 0.8,
            top: state.y * tileSize + tileSize * 0.1,
            left: state.x * tileSize + tileSize * 0.1,
            transition: "top 0.1s, left 0.1s",
          }}
        />

        {/* PNJ */}
        {level.npcs.map((n) => (
          <div
            key={n.id}
            className="absolute bg-red-500"
            style={{
              width: tileSize * 0.8,
              height: tileSize * 0.8,
              top: n.y * tileSize + tileSize * 0.1,
              left: n.x * tileSize + tileSize * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
