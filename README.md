# Shaarp Agent Scraper

> Agent d’extraction B2B intelligent pour récupérer automatiquement les exposants d’un salon professionnel à partir d’une simple URL.

## Présentation

Shaarp Agent Scraper est une application web développée pour automatiser l’extraction d’exposants depuis des sites de salons professionnels.

L’utilisateur colle une URL dans l’interface, puis l’application :
- analyse la structure du site,
- détecte la logique de navigation,
- collecte les fiches exposants,
- extrait les informations utiles,
- affiche les résultats dans un tableau,
- permet l’export des données en CSV.

Le projet a été conçu comme un MVP clair, rapide à prendre en main et facilement démontrable.

---

## Fonctionnalités

- Saisie d’une URL via une interface conversationnelle
- Détection automatique du lien à analyser
- Scraping intelligent avec navigateur headless
- Analyse dynamique de la structure d’un site
- Gestion de plusieurs modes de navigation :
  - pagination classique
  - bouton “charger plus”
  - défilement infini
- Nettoyage automatique des obstacles de navigation :
  - bannières cookies
  - modales RGPD
  - overlays bloquants
- Extraction de données exposants :
  - nom
  - site web
  - stand
  - email
  - téléphone
  - LinkedIn
  - Twitter / X
- Suivi de progression pendant l’analyse
- Affichage des résultats dans un tableau
- Export CSV des leads extraits

---

## Stack technique

### Front-end
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- composants UI

### Back-end / logique
- Next.js App Router
- route API `/api/chat`
- Vercel AI SDK
- OpenAI

### Scraping / extraction
- Playwright
- Zod
- PapaParse

---

## Prérequis

Avant de lancer le projet, il faut avoir installé :

- **Node.js 18 ou supérieur**
- **npm**
- une **connexion internet active**
- une **clé API OpenAI**

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/damiengmrr/Scraper-Agent.git
cd Scraper-Agent
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Installer Chromium pour Playwright

Le projet utilise Playwright pour piloter un navigateur headless pendant le scraping.

```bash
npx playwright install chromium
```

### 4. Configurer les variables d’environnement

Crée un fichier `.env.local` à la racine du projet :

```env
OPENAI_API_KEY=your_api_key_here
```

---

## Lancer le projet

### En développement

```bash
npm run dev
```

Puis ouvre dans ton navigateur :

```bash
http://localhost:3000
```

### En production locale

Build du projet :

```bash
npm run build
```

Lancer le serveur :

```bash
npm run start
```

---

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## Utilisation

1. Lance l’application
2. Colle l’URL d’une page de salon professionnel ou d’une liste d’exposants
3. Démarre l’analyse
4. Suis les étapes affichées dans l’interface :
   - analyse de structure
   - collecte des liens
   - extraction des fiches
   - affichage des résultats
5. Consulte les exposants extraits
6. Exporte les données au format CSV

---

## Structure du projet

```bash
Scraper-Agent/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── Chat.tsx
│   │   ├── ExhibitorsTable.tsx
│   │   └── ScrapeProgress.tsx
│   └── lib/
│       ├── tools/
│       │   └── scrapeExhibitors.ts
│       ├── schema.ts
│       └── utils.ts
├── .gitignore
├── README.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Organisation du projet

### `src/app`
Contient la structure principale de l’application Next.js :
- `page.tsx` : page principale
- `layout.tsx` : layout global
- `globals.css` : styles globaux
- `api/chat` : route API pour traiter les messages et lancer le scraping

### `src/components`
Contient les composants d’interface :
- `Chat.tsx` : interface conversationnelle
- `ExhibitorsTable.tsx` : tableau des exposants extraits
- `ScrapeProgress.tsx` : affichage de la progression du scraping
- `ui/` : composants d’interface réutilisables

### `src/lib`
Contient la logique métier du projet :
- `tools/scrapeExhibitors.ts` : moteur principal de scraping
- `schema.ts` : schémas de validation des données
- `utils.ts` : fonctions utilitaires

---

## Fonctionnement global

### 1. Envoi d’une URL
L’utilisateur renseigne l’URL d’une page de salon ou d’une page listant des exposants.

### 2. Détection du lien
L’application détecte automatiquement le lien transmis dans le message.

### 3. Analyse de la structure
Le scraper analyse la logique de navigation du site pour comprendre comment récupérer toutes les fiches disponibles.

### 4. Collecte des fiches exposants
Le moteur explore les pages, récupère les liens utiles et s’adapte au fonctionnement du site.

### 5. Extraction des données
Chaque fiche exposant est ensuite visitée pour extraire les informations utiles.

### 6. Affichage et export
Les résultats sont affichés dans un tableau puis exportables en CSV.

---

## Données extraites

Chaque exposant peut contenir les informations suivantes :

```ts
{
  name: string
  website: string
  booth: string
  linkedin: string
  twitter: string
  email: string
  phone: string
}
```

---

## Auteur

Projet développé dans le cadre d’un challenge de 48h autour d’un agent IA de scraping et d’extraction d’exposants pour salons professionnels.