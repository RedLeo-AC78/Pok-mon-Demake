"use client";

import { useState, useEffect, useRef } from "react";

type NPC = { id: string; x: number; y: number; dialogKey: string };
type Level = { width: number; height: number; npcs: NPC[] };
type GameState = {
  id?: number;
  name: string;
  team: string[];
  x: number;
  y: number;
};

export default function GamePage() {
  const [level, setLevel] = useState<Level | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [tileSize, setTileSize] = useState(32);
  const [direction, setDirection] = useState<
    "front" | "back" | "left" | "right"
  >("front");
  const audioRef = useRef<HTMLAudioElement>(null);

  const [inDialog, setInDialog] = useState(false);
  const [dialogLines, setDialogLines] = useState<string[]>([]);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [currentNpcId, setCurrentNpcId] = useState<string | null>(null);

  // 1) Chargement carte + état
  useEffect(() => {
    Promise.all([
      fetch("/levels/station.json").then((r) => r.json()),
      Promise.resolve(JSON.parse(localStorage.getItem("gameState") || "null")),
    ]).then(([lvl, gs]) => {
      setLevel(lvl);
      setState(gs);
    });
  }, []);

  // 2) Dimensionnement dynamique
  useEffect(() => {
    if (!level) return;
    const onResize = () => {
      const w = window.innerWidth / level.width;
      const h = window.innerHeight / level.height;
      setTileSize(Math.floor(Math.min(w, h)));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [level]);

  // 3) Lecture musique sur interaction
  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    // Tentative d'autoplay
    unlockAudio();
    // Si bloqué, on réessaie au premier click ou touche
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // 4) Clavier (déplacement + dialogue)
  useEffect(() => {
    if (!level || !state) return;
    const handleKey = (e: KeyboardEvent) => {
      // gestion dialogue...
      if (inDialog) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const next = dialogIndex + 1;
          if (next < dialogLines.length) {
            setDialogIndex(next);
          } else {
            setInDialog(false);
            setDialogLines([]);
            setDialogIndex(0);
            if (currentNpcId === "billy") {
              setTimeout(() => (window.location.href = "/battle"), 300);
            }
            setCurrentNpcId(null);
          }
        }
        return;
      }

      let nx = state.x,
        ny = state.y;
      switch (e.key) {
        case "ArrowUp":
          setDirection("back");
          ny--;
          break;
        case "ArrowDown":
          setDirection("front");
          ny++;
          break;
        case "ArrowLeft":
          setDirection("left");
          nx--;
          break;
        case "ArrowRight":
          setDirection("right");
          nx++;
          break;
        case "p":
        case "P":
          fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: state.id,
              name: state.name,
              x: state.x,
              y: state.y,
              team: state.team,
            }),
          }).then(() => alert("Partie sauvegardée"));
          return;
        case " ":
          const npc = level.npcs.find(
            (n) => Math.abs(n.x - state.x) + Math.abs(n.y - state.y) === 1
          );
          if (npc) {
            setCurrentNpcId(npc.id);
            fetch("/levels/dialogs.json")
              .then((r) => r.json())
              .then((dialogs: Record<string, string[]>) => {
                const lines = dialogs[npc.dialogKey] || [`...${npc.id}`];
                setDialogLines(lines);
                setDialogIndex(0);
                setInDialog(true);
              });
          }
          return;
        default:
          return;
      }
      if (nx < 0 || ny < 0 || nx >= level.width || ny >= level.height) return;
      setState((s) => s && { ...s, x: nx, y: ny });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [level, state, inDialog, dialogIndex, dialogLines, currentNpcId]);

  if (!level || !state) return <div>Chargement…</div>;

  const mapW = level.width * tileSize;
  const mapH = level.height * tileSize;
  const spriteUrl = `/sprites/hero_walk_${direction}.gif`;
  const spriteSize = tileSize * 2;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <audio ref={audioRef} src="/audio/Station_service.mp3" loop autoPlay />

      <div className="relative mx-auto" style={{ width: mapW, height: mapH }}>
        <img
          src="/images/station_service_intérieur.png"
          alt="Station Service"
          className="absolute inset-0 w-full h-full"
        />

        <img
          src="/sprites/Nidoqueen.gif"
          alt="TV Screen"
          className="absolute"
          style={{
            left: tileSize * 4.6,
            top: tileSize * 2.1,
            width: tileSize * 3.9,
            height: tileSize * 2.5,
          }}
        />

        <img
          src={spriteUrl}
          alt="Joueur"
          className="absolute"
          style={{
            width: spriteSize,
            height: spriteSize,
            left: state.x * tileSize + (tileSize - spriteSize) / 2,
            top: state.y * tileSize + (tileSize - spriteSize) / 2,
            transition: "left 0.1s, top 0.1s",
          }}
        />

        {level.npcs.map((n) => (
          <div
            key={n.id}
            className="absolute opacity-0"
            style={{
              width: tileSize * 0.8,
              height: tileSize * 0.8,
              left: n.x * tileSize + tileSize * 0.1,
              top: n.y * tileSize + tileSize * 0.1,
            }}
          />
        ))}

        {inDialog && (
          <div className="absolute bottom-0 w-full bg-black bg-opacity-75 p-4 text-white">
            <p>{dialogLines[dialogIndex]}</p>
            <p className="text-sm text-gray-400 mt-2">[Appuyez sur Entrée]</p>
          </div>
        )}
      </div>
    </div>
  );
}
