export default function Home() {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url(/images/Background.png)" }}
    >
      {/* Musique en fond */}
      <audio src="/audio/MainTitle.mp3" autoPlay loop />

      <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-lg">
        Pokémon Colosseum Demake
      </h1>

      <div className="space-y-4">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xl hover:bg-blue-700 transition">
          Nouveau Jeu
        </button>

        <button className="px-8 py-3 bg-green-600 text-white rounded-xl text-xl hover:bg-green-700 transition">
          Charger
        </button>
      </div>
    </div>
  );
}
