# Pokémon Colosseum DEMAKE

Une démo d’introduction “démake” du jeu **Pokémon Colosseum**, réalisée avec React et Next.js, et utilisant la PokeAPI pour récupérer sprites et données de combat.

---

## 🚀 Présentation

Ce projet propose :

- Un **écran titre** avec fond animé et musique de menu, boutons **Nouveau jeu** / **Charger**
- Une **vidéo d’introduction** (skippable par Entrée)
- Une **création de personnage** : choix du nom et de deux Pokémon (générations 1–3) avec aperçu sprite et types
- Une **exploration** 2D de la station service : déplacement en grille, interaction PNJ, flash info TV avec gif
- Un **combat** contre Billy (1v1) : interface inspirée GBA, musique de combat, changement automatique de Pokémon
- Un **système de sauvegarde** dans `localStorage` (création, sauvegarde en cours de jeu avec la touche **P**, chargement)

---

## 📦 Prérequis

- **Node.js** ≥ 16.x et **npm**  
- Navigateurs modernes (Chrome, Firefox, Edge, Safari)  
- (Optionnel) Git pour cloner le dépôt  

---

## 🔧 Installation & lancement

1. **Cloner le dépôt**  
   ```bash
   git clone https://github.com/RedLeo-AC78/Pok-mon-Demake.git
   cd Pok-mon-Demake

## Installer les dépendances

bash
Copier
Modifier
npm install
Vérifier l’arborescence public/

public/audio/ :

menu-music.mp3

crea-music.mp3

Station_service.mp3

Battle.mp3

public/images/ :

title-background.png

crea-background.png

station_service_intérieur.png

BattleGround.png

public/sprites/ :

hero_walk_front.gif

hero_walk_back.gif

hero_walk_left.gif

hero_walk_right.gif

Nidoqueen.gif

public/videos/ :

intro.mp4


## Démarrer le serveur de développement

npm run dev
Le jeu sera accessible sur http://localhost:3000

## 🎮 Contrôles
Flèches : déplacer le personnage

Espace : interagir avec un PNJ / avancer le dialogue

Entrée :

passer la vidéo d’intro

avancer le texte dans les boîtes de dialogue

P : sauvegarder la partie en cours

(À venir) Esc : ouvrir le menu pause

## ⚙️ Configuration multi-OS
Les commandes npm install et npm run dev fonctionnent sur Windows, macOS et Linux.

Sur Windows (PowerShell ou cmd.exe), lancez en mode administrateur si besoin.

Sur macOS/Linux, préfixez par sudo si vous rencontrez des problèmes de permissions.

## 🗂️ Structure du projet

Pok-mon-Demake/
├─ app/
│  ├─ api/        routes Next.js pour la sauvegarde (optionnel)
│  ├─ intro/      page d’intro (vidéo)
│  ├─ crea/       création & chargement de personnage
│  ├─ game/       exploration & dialogues
│  ├─ battle/     interface de combat
│  ├─ end/        écran de fin
│  └─ page.tsx    écran titre
├─ public/
│  ├─ audio/      musiques et sons
│  ├─ images/     fonds & éléments statiques
│  ├─ sprites/    GIFs de marche et autres sprites
│  └─ videos/     intro.mp4
├─ levels/        JSON de carte et dialogues
├─ lib/           (optionnel) configuration DB
├─ package.json
└─ README.md

## 🚀 Extensions possibles
Back-end MySQL via Next.js API Routes

Menu pause / options sonores

Gestion d’objets et d’inventaire

Transition vers de nouvelles zones (Phénacit…)

Tests unitaires et déploiement continu

Merci d’avoir testé ce proof-of-concept !
Profitez bien et n’hésitez pas à contribuer ou remonter d’éventuels bugs.
