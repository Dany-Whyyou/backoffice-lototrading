# LotoTrading - Backoffice

Dashboard d'administration Next.js pour la gestion de la plateforme LotoTrading.

## Prerequis

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Configuration

Creer `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Demarrage

```bash
npm run dev
```

Le backoffice sera accessible sur http://localhost:3000

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- Lucide React (icones)

## Modules

- **Dashboard** : statistiques generales
- **Lotos** : CRUD des types de loterie
- **Clients** : gestion des comptes clients
- **Utilisateurs** : gestion des admins/operateurs
- **Tickets en attente** : traitement des demandes
- **Tickets valides** : historique des tickets joues
