# Pokémon-Demake

Pokémon Colosseum DEMAKE

Une démo d’introduction “démake” du jeu Pokémon Colosseum, réalisée avec React et Next.js, et utilisant la PokeAPI pour récupérer sprites et données de combat.

🚀 Fonctionnalités

Écran titre avec fond animé et musique de menu, navigation Nouveau Jeu / Charger

Vidéo d’intro en plein écran, skippable par Entrée

Création de personnage : saisie du nom, choix de deux Pokémon (génération 1–3) avec aperçu sprite et types

Exploration dans la station service : déplacement en grille, interaction PNJ, flash info à la TV (affiché via un GIF)

Combat contre Billy en 1v1, interface inspirée GBA, musique de combat, changement automatique de Pokémon

Système de sauvegarde en localStorage (création, sauvegarde en jeu avec la touche P, chargement)

📦 Installation

Cloner le dépôt :
git clone https://github.com/RedLeo-AC78/Pok-mon-Demake.git
cd Pok-mon-Demake

Installer les dépendances :
npm install

Vérifier l’arborescence public/ :
• public/audio/ : menu-music.mp3, crea-music.mp3, Station_service.mp3, Battle.mp3
• public/images/ : title-background.png, crea-background.png, station_service_intérieur.png, BattleGround.png
• public/sprites/ : hero_walk_front.gif, hero_walk_back.gif, hero_walk_left.gif, hero_walk_right.gif, Nidoqueen.gif
• public/videos/ : intro.mp4

Démarrer le serveur de développement :
npm run dev
→ http://localhost:3000

⚙️ Configuration et options
• Back-end MySQL (optionnel) : configurez lib/db.ts, décommentez app/api/route.ts
•  :
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=your_password
MYSQL_DB=pokemon

Touches
• Flèches : déplacement
• Espace : interaction / avancer dialogues
• P : sauvegarder
• Entrée : skip intro / avancer dialogues

📈 Extensions possibles
• Animations de dialogue “machine à écrire”
• Menu pause / options sonores
• Gestion d’inventaire
• Nouvelles zones (Phénacit…)
• Tests unitaires et couverture

Merci d’avoir joué !
