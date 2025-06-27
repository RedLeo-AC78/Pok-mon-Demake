"use client";

import { useState, useEffect, useRef } from "react";

type PokeData = {
  name: string;
  stats: { base_stat: number; stat: { name: string } }[];
  moves: {
    move: { name: string };
    version_group_details: { level_learned_at: number }[];
  }[];
  sprites: { front_default: string; back_default: string };
};

type Combatant = {
  data: PokeData;
  currentHp: number;
  maxHp: number;
  moves: { name: string; power: number }[];
};

export default function BattlePage() {
  // — Hooks d’état
  const [playerTeam, setPlayerTeam] = useState<Combatant[]>([]);
  const [billyTeam, setBillyTeam] = useState<Combatant[]>([]);
  const [curPlayerIdx, setCurPlayerIdx] = useState(0);
  const [curOppIdx, setCurOppIdx] = useState(0);
  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [log, setLog] = useState<string[]>([]);

  // Audio de combat
  const audioRef = useRef<HTMLAudioElement>(null);

  // Helper redirection fin de combat
  function finishBattle() {
    setTimeout(() => (window.location.href = "/end"), 2000);
  }

  // Calculs
  const calcHp = (baseHp: number) =>
    Math.floor((baseHp * 2 * 25) / 100) + 25 + 10;
  const computeDamage = (atk: number, def: number, power: number) =>
    Math.max(1, Math.floor((((atk * power) / def) * 25) / 50) + 2);

  // 1) Initialisation et musique
  useEffect(() => {
    const audio = audioRef.current;
    const unlock = () => {
      if (audio) {
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    unlock();
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    (async () => {
      const gs = JSON.parse(localStorage.getItem("gameState") || "null");
      const billys = ["zigzagoon", "linoone"];
      const [p1, p2, b1, b2] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${gs.team[0]}`).then((r) =>
          r.json()
        ),
        fetch(`https://pokeapi.co/api/v2/pokemon/${gs.team[1]}`).then((r) =>
          r.json()
        ),
        fetch(`https://pokeapi.co/api/v2/pokemon/${billys[0]}`).then((r) =>
          r.json()
        ),
        fetch(`https://pokeapi.co/api/v2/pokemon/${billys[1]}`).then((r) =>
          r.json()
        ),
      ]);
      const build = (data: PokeData): Combatant => {
        const baseHp = data.stats.find((s) => s.stat.name === "hp")!.base_stat;
        const maxHp = calcHp(baseHp);
        const moves = data.moves
          .filter((m) =>
            m.version_group_details.some((v) => v.level_learned_at <= 25)
          )
          .map((m) => m.move.name)
          .slice(0, 2)
          .map((name) => ({ name, power: 40 }));
        return { data, currentHp: maxHp, maxHp, moves };
      };
      setPlayerTeam([build(p1), build(p2)]);
      setBillyTeam([build(b1), build(b2)]);
      setLog([`Un ${b1.name} sauvage apparaît !`]);
    })();

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // 2) Tour de Billy
  useEffect(() => {
    if (turn !== "opponent") return;
    const curOpp = billyTeam[curOppIdx];
    const curPlayer = playerTeam[curPlayerIdx];
    if (!curOpp || curOpp.currentHp === 0 || !curPlayer) return;

    const t = setTimeout(() => {
      const move = curOpp.moves[0];
      const atk = curOpp.data.stats.find(
        (s) => s.stat.name === "attack"
      )!.base_stat;
      const def = curPlayer.data.stats.find(
        (s) => s.stat.name === "defense"
      )!.base_stat;
      const dmg = computeDamage(atk, def, move.power);

      curPlayer.currentHp = Math.max(0, curPlayer.currentHp - dmg);
      setPlayerTeam([...playerTeam]);
      setLog((l) => [
        ...l,
        `Billy utilise ${move.name} et inflige ${dmg} dégâts !`,
      ]);

      if (curPlayer.currentHp === 0) {
        // switch vers le second Pokémon si possible
        if (curPlayerIdx < playerTeam.length - 1) {
          setLog((l) => [
            ...l,
            `${playerTeam[curPlayerIdx].data.name} est K.O.! Votre ${
              playerTeam[curPlayerIdx + 1].data.name
            } entre en jeu!`,
          ]);
          setCurPlayerIdx((idx) => idx + 1);
        } else {
          setLog((l) => [...l, "Vous êtes vaincu…"]);
          finishBattle();
        }
      }

      setTurn("player");
    }, 1000);
    return () => clearTimeout(t);
  }, [turn, curOppIdx, playerTeam, billyTeam, curPlayerIdx]);

  // 3) Fonction de clic sur les attaques
  function handlePlayerMove(i: number) {
    if (turn !== "player") return;
    const curPlayer = playerTeam[curPlayerIdx];
    const curOpp = billyTeam[curOppIdx];
    if (!curPlayer || !curOpp) return;

    const move = curPlayer.moves[i];
    const atk = curPlayer.data.stats.find(
      (s) => s.stat.name === "attack"
    )!.base_stat;
    const def = curOpp.data.stats.find(
      (s) => s.stat.name === "defense"
    )!.base_stat;
    const dmg = computeDamage(atk, def, move.power);

    curOpp.currentHp = Math.max(0, curOpp.currentHp - dmg);
    setBillyTeam([...billyTeam]);
    setLog((l) => [
      ...l,
      `${curPlayer.data.name} utilise ${move.name} et inflige ${dmg} dégâts !`,
    ]);

    if (curOpp.currentHp === 0) {
      if (curOppIdx < billyTeam.length - 1) {
        setLog((l) => [
          ...l,
          `Billy envoie ${billyTeam[curOppIdx + 1].data.name} !`,
        ]);
        setCurOppIdx((idx) => idx + 1);
      } else {
        setLog((l) => [...l, "Victoire !"]);
        finishBattle();
      }
    }
    setTurn("opponent");
  }

  // 4) Rendu
  const curPlayer = playerTeam[curPlayerIdx];
  const curOpp = billyTeam[curOppIdx];
  if (!curPlayer || !curOpp) return <div>Préparation…</div>;

  const spriteSize = 96;
  const oppStyle = {
    position: "absolute" as const,
    left: "60%",
    top: "18%",
    width: `${spriteSize}px`,
    height: `${spriteSize}px`,
    transform: "translate(-50%,-50%)",
  };
  const playerStyle = {
    position: "absolute" as const,
    left: "25%",
    top: "62%",
    width: `${spriteSize}px`,
    height: `${spriteSize}px`,
    transform: "translate(-50%,-50%)",
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      <audio ref={audioRef} src="/audio/Battle.mp3" loop autoPlay />

      <div className="relative w-full max-w-screen-xl aspect-video">
        <img
          src="/images/BattleGround.png"
          alt="Battle Ground"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <img src={curOpp.data.sprites.front_default} style={oppStyle} alt="" />
        <img
          src={curPlayer.data.sprites.back_default}
          style={playerStyle}
          alt=""
        />

        {/* Barres de PV */}
        <div className="absolute right-4 top-4 bg-black bg-opacity-50 p-2 rounded">
          <div className="text-white text-sm mb-1">
            {curOpp.data.name.toUpperCase()}
          </div>
          <div className="w-32 h-2 bg-red-600">
            <div
              className="h-2 bg-green-500"
              style={{ width: `${(curOpp.currentHp / curOpp.maxHp) * 100}%` }}
            />
          </div>
        </div>
        <div className="absolute left-4 top-4 bg-black bg-opacity-50 p-2 rounded text-right">
          <div className="text-white text-sm mb-1">
            {curPlayer.data.name.toUpperCase()}
          </div>
          <div className="w-32 h-2 bg-red-600 ml-auto">
            <div
              className="h-2 bg-green-500"
              style={{
                width: `${(curPlayer.currentHp / curPlayer.maxHp) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Attaques & journal */}
        <div className="absolute bottom-0 w-full bg-gray-800 p-4 flex">
          <div className="grid grid-cols-2 gap-2 w-1/3">
            {curPlayer.moves.map((m, i) => (
              <button
                key={i}
                className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                disabled={turn !== "player"}
                onClick={() => handlePlayerMove(i)}
              >
                {m.name}
              </button>
            ))}
            {curPlayer.moves.length < 4 &&
              Array.from({ length: 4 - curPlayer.moves.length }).map((_, i) => (
                <button
                  key={i}
                  className="bg-gray-700 text-gray-400 py-2 rounded cursor-default"
                  disabled
                >
                  —
                </button>
              ))}
          </div>
          <div className="flex-1 ml-4 bg-gray-700 text-white p-2 h-32 overflow-y-auto rounded">
            {log.map((t, i) => (
              <p key={i} className="text-sm">
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
