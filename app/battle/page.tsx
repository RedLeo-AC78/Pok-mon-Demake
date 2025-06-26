"use client";

import { useState, useEffect } from "react";

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
  const [playerTeam, setPlayerTeam] = useState<Combatant[]>([]);
  const [billyTeam, setBillyTeam] = useState<Combatant[]>([]);
  const [curPlayerIdx, setCurPlayerIdx] = useState(0);
  const [curOppIdx, setCurOppIdx] = useState(0);
  const [turn, setTurn] = useState<"player" | "opponent">("player");
  const [log, setLog] = useState<string[]>([]);

  // Calcul PV et dégâts
  const calcHp = (baseHp: number) =>
    Math.floor((baseHp * 2 * 25) / 100) + 25 + 10;
  const computeDamage = (atk: number, def: number, power: number) =>
    Math.max(1, Math.floor((((atk * power) / def) * 25) / 50) + 2);

  // Initialisation
  useEffect(() => {
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
        const avail = data.moves
          .filter((m) =>
            m.version_group_details.some((v) => v.level_learned_at <= 25)
          )
          .map((m) => m.move.name);
        const moves = avail.slice(0, 2).map((name) => ({ name, power: 40 }));
        return { data, currentHp: maxHp, maxHp, moves };
      };

      setPlayerTeam([build(p1), build(p2)]);
      setBillyTeam([build(b1), build(b2)]);
      setLog([`Un ${b1.name} sauvage apparaît !`]);
    })();
  }, []);

  const curPlayer = playerTeam[curPlayerIdx];
  const curOpp = billyTeam[curOppIdx];

  // Tour du joueur
  const handlePlayerMove = (i: number) => {
    if (turn !== "player" || !curPlayer || !curOpp) return;
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
      `${curPlayer.data.name} utilise ${move.name}, ${dmg} dégâts !`,
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
      }
    }
    setTurn("opponent");
  };

  // Tour de l’adversaire
  useEffect(() => {
    if (turn !== "opponent" || !curOpp || curOpp.currentHp === 0) return;
    const t = setTimeout(() => {
      const move = curOpp.moves[0];
      const atk = curOpp.data.stats.find(
        (s) => s.stat.name === "attack"
      )!.base_stat;
      const def = curPlayer!.data.stats.find(
        (s) => s.stat.name === "defense"
      )!.base_stat;
      const dmg = computeDamage(atk, def, move.power);

      curPlayer!.currentHp = Math.max(0, curPlayer!.currentHp - dmg);
      setPlayerTeam([...playerTeam]);
      setLog((l) => [...l, `Billy utilise ${move.name}, ${dmg} dégâts !`]);
      if (curPlayer!.currentHp === 0)
        setLog((l) => [...l, "Vous êtes vaincu…"]);
      setTurn("player");
    }, 1000);
    return () => clearTimeout(t);
  }, [turn, curOppIdx, playerTeam, billyTeam]);

  if (!curPlayer || !curOpp) return <div>Préparation du combat…</div>;

  // Styles à ajuster si nécessaire
  const spriteSize = 96;
  const oppStyle = {
    position: "absolute" as const,
    left: "65%",
    top: "43%",
    width: `150px`,
    height: `150px`,
    transform: "translate(-50%, -50%)",
  };
  const playerStyle = {
    position: "absolute" as const,
    left: "28%",
    top: "58%",
    width: `150px`,
    height: `150px`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      {/* Conteneur 16:9 pour le fond */}
      <div className="relative w-full max-w-screen-xl aspect-video">
        {/* Fond de combat */}
        <img
          src="/images/BattleGround.png"
          alt="Battle Ground"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Sprites Pokémon */}
        <img src={curOpp.data.sprites.front_default} style={oppStyle} alt="" />
        <img
          src={curPlayer.data.sprites.back_default}
          style={playerStyle}
          alt=""
        />

        {/* Barre de vie adversaire (haut gauche) */}
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

        {/* Barre de vie joueur (bas droite) */}
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

        {/* Interface d’action (bas) */}
        <div className="absolute bottom-0 w-full bg-gray-800 p-4 flex">
          {/* Boutons 2×2 */}
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
            {/* Remplissage si moins de 4 */}
            {curPlayer.moves.length < 4 &&
              Array.from({ length: 4 - curPlayer.moves.length }).map((_, i) => (
                <button
                  key={`empty-${i}`}
                  className="bg-gray-700 text-gray-400 py-2 rounded cursor-default"
                  disabled
                >
                  —
                </button>
              ))}
          </div>
          {/* Journal des actions */}
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
