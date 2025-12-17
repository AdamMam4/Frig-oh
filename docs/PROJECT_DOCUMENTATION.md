# Documentation complète du projet — Frig'Oh

Ce document décrit le projet Frig'Oh de manière complète : objectifs, périmètre fonctionnel, architecture, technologies, structure du dépôt, instructions de développement et déploiement, décisions techniques et pistes d'amélioration.

---

## Table des matières

- Contexte & objectifs
- Vision produit
- Périmètre fonctionnel (cahier des charges)
- Architecture & design technique
- Technologies utilisées
- Structure du dépôt et fichiers importants
- Composants principaux et responsabilité
- Assets (3D, images, etc.)
- Installation, exécution et développement local
- Tests, build et lint
- Déploiement
- Workflow Git & bonnes pratiques
- Opérations courantes / troubleshooting
- Sécurité & confidentialité
- Roadmap / améliorations futures
- Contribution

---

## Contexte & objectifs

Frig'Oh est une application web front-end visant à proposer une interface attractive pour découvrir et gérer des recettes/plats. L'un des éléments visuels distinctifs est un "hero" graphique à droite de la page de connexion, rendu à l'aide d'un modèle 3D (.glb) représentant un plat.

Objectifs principaux :
- Présenter un rendu 3D interactif et performant dans le hero de la page de connexion.
- Permettre une interaction simple (orientation par glisser) tout en offrant une option passive.
- Construire la solution sans introduire de conflits de dépendances (React 19 actuellement), d'où l'usage de three.js vanilla.

## Vision produit

Offrir une application intuitive où les utilisateurs peuvent se connecter et être accueillis par une présentation soignée (3D). L'aspect visuel doit donner un avant-goût de l'expérience culinaire proposée par l'application.

## Périmètre fonctionnel (cahier des charges)

Fonctionnalités essentielles :

1. Page de connexion avec formulaire (email / mot de passe) et bouton de connexion.
2. Zone hero sur la droite affichant un modèle 3D (`public/Ramen.glb`).
3. Auto-fit du modèle : calcul de la bounding box, recentrage et scale par défaut (1.2 = +20%).
4. Interaction : l'utilisateur peut orienter le modèle en glissant (drag) horizontalement et verticalement.
5. Possibilité de désactiver l'interaction (mode passif) — implementation côté composant ou via props.
6. Rendu alpha (canvas transparent) pour respecter le design d'arrière-plan.

Exigences non-fonctionnelles :

- Compatibilité TypeScript (pas d'erreurs à la compilation).
- Performance acceptable sur desktop moderne ; modèle optimisé conseillé.
- Nettoyage propre des ressources graphiques au démontage.
- Pas d'interférence avec la sélection de texte lors du drag (canvas capte les événements).

## Architecture & design technique

- Frontend : React + TypeScript (Create React App)
- Rendu 3D : three.js (vanilla). Raison : éviter peer-deps avec `@react-three/fiber` et React 19.
- Chargement model : `GLTFLoader` depuis `three/examples/jsm/loaders/GLTFLoader`.
- Pattern : un composant React (`SaladThree`) initialise la scène, la caméra, le renderer et gère le cycle de vie (mount/unmount).
- Interaction : écouteurs `pointerdown` / `pointermove` / `pointerup` pour gérer le drag et appliquer une interpolation (lerp) vers les rotations cibles.

Décisions notables :

- three.js (vanilla) a été préféré pour réduire la surface de conflits de dépendances.
- Le modèle est servi depuis `public/` pour simplifier la distribution statique.

## Technologies utilisées

- TypeScript
- React (Create React App) / react-scripts
- three.js (vanilla) + `GLTFLoader`
- Tailwind CSS (ou utilitaires CSS présents)
- Framer Motion (utilisé précédemment pour prototypes SVG — optionnel)
- npm

## Structure du dépôt et fichiers importants

- `package.json` — scripts et dépendances
- `public/` — fichiers statiques
  - `Ramen.glb` — modèle 3D du plat
- `src/`
  - `index.tsx` — point d'entrée
  - `App.tsx` — wrapper principal
  - `components/`
    - `LoginPage.tsx` — page de login + hero
    - `SaladThree.tsx` — rendu three.js et logique de contrôle/auto-fit
    - `SaladMotion.tsx` — prototype SVG/Framer Motion (optionnel)
  - `App.css`, `index.css` — styles
- `docs/PROJECT_DOCUMENTATION.md` — documentation (ce fichier)

## Composants principaux et responsabilités

- `SaladThree` :
  - Initialise `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer`.
  - Charge le `.glb` via `GLTFLoader`.
  - Calcule `Box3` (bounding box) et recentre la géométrie en soustrayant le centre.
  - Applique un scale (`modelGroup.scale.setScalar(1.2)`) et un offset vertical (`modelGroup.position.y`) pour un cadrage visuel.
  - Ajoute listeners pointer pour rotation par drag et interpolation dans la boucle d'animation.
  - Gère le resize et le nettoyage des ressources (dispose geometries/materials).

- `LoginPage` : intègre le formulaire et positionne le `SaladThree` dans le layout du hero.

## Assets et modèles 3D

- Emplacement principal : `public/Ramen.glb`.
- Recommandations :
  - Optimiser les modèles (réduire polygones, compresser textures, utiliser Draco) avant production.
  - Si vous servez le modèle depuis un CDN, configurez CORS ou mettez le modèle sous le même domaine.

## Installation, exécution et développement local

Prérequis : Node.js (LTS recommandé), npm.

Installation :

```powershell
npm install
```

Démarrer le serveur de développement :

```powershell
npm start
```

Construire pour la production :

```powershell
npm run build
```

Remarques sur les peer-deps : si vous essayez d'ajouter `@react-three/fiber` au projet il peut y avoir des conflits avec React 19 ; pour cette raison, le projet utilise `three` directement.

## Tests, lint et qualité

- TypeScript : la compilation (`npm run build`) permet de détecter des erreurs.
- Tests unitaires : si vous avez mis en place `jest`/`react-testing-library`, lancez `npm test`.
- Lint : configurez `eslint`/`prettier` selon vos conventions (non inclus par défaut dans ce dépôt si absent).

## Déploiement

1. `npm run build` produit le dossier `build/`.
2. Déployez `build/` sur votre hébergeur (Vercel, Netlify, S3 + CloudFront, etc.).
3. Assurez-vous que `public/Ramen.glb` soit servi correctement et que les chemins soient accessibles depuis la page.

## Workflow Git & bonnes pratiques

- Branche feature : `feature/<description>` ou `feat/<description>`.
- Branche de bugfix : `fix/<description>`.
- Branche principale de travail : `animation` (actuellement utilisée) puis merge vers `main` après revue.
- Commit messages courts et explicites (ex. `feat(hero): add glb auto-fit and drag controls`).
- Ouvrir une PR et demander une review avant le merge.

## Opérations courantes / troubleshooting

- Erreur d'installation liée aux peer-deps (ERESOLVE) : vérifier les paquets ajoutés (notamment `@react-three/fiber`) ; si nécessaire installer avec `npm install --legacy-peer-deps` ou éviter le package.
- Modèle trop bas/haut : ajuster `modelGroup.position.y` dans `src/components/SaladThree.tsx`.
- Rendu absent : vérifier que `public/Ramen.glb` est présent et que le loader n'affiche pas d'erreur dans la console.
- Mémoire/ fuite : s'assurer du `traverse` lors du cleanup pour `geometry.dispose()` et `material.dispose()`.

## Sécurité & confidentialité

- Ne pas committer de secrets (API keys, credentials). Utiliser des variables d'environnement et `.env` pour le développement (ajouter `.env` à `.gitignore`).

## Roadmap / améliorations futures

- Ajouter un bouton UI pour réinitialiser l'orientation du modèle.
- Ajouter inertie (momentum) au drag.
- Ajuster automatiquement la caméra (fit camera to bbox) pour un cadrage parfait.
- Support LOD & compression Draco pour réduire le poids des assets 3D.
- Fallback visuel (image/SVG) si le GLB met du temps à charger.
- Tests e2e couvrant l'interaction du hero (Cypress / Playwright).

## Contribuer

- Forker le repo / créer une branche depuis `animation`.
- Ouvrir une PR décrite, avec lien vers issues si nécessaire.
- Respecter les conventions de code (TypeScript strict, prettierrc/eslint si configurés).

---

Si vous voulez que je commit et pousse directement ce fichier sur la branche `animation`, je peux le faire maintenant. Je peux aussi :

- Ajouter un résumé dans le `README.md`.
- Générer automatiquement des issues GitHub basées sur le cahier des charges.
- Produire un petit diagramme d'architecture (SVG) et l'ajouter dans `docs/`.

Dites-moi quelle action vous voulez ensuite (commit/push, ajustements, diagramme, issues...).
