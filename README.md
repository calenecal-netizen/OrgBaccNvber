# MORGAN_Bacc — Web Service (Render)

Structure prête à déployer sur **Render** en un seul Web Service.

## Contenu

```
morgan-bacc-render/
├── package.json
├── server.js              ← Express + routes API
├── public/
│   └── index.html         ← Frontend complet
├── data/                  ← créé automatiquement (clés utilisées)
└── README.md
```

## Routes API fournies

| Méthode | Route | Rôle |
|---------|-------|------|
| `POST` | `/api/redeem-key` | Valide une clé (hash) et la marque comme utilisée |
| `GET`  | `/api/history?limit=150&channel=...` | Historique des jeux (mock pour l’instant) |
| `GET`  | `/api/latest-game?channel=...` | Dernier jeu (mock) |
| `GET`  | `/health` | Healthcheck Render |

## Déploiement sur Render (Web Service)

1. **Pousse le dossier sur GitHub** (repo public ou privé).

2. Sur [render.com](https://render.com) → **New → Web Service**
   - Connecte le repo
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : Free (ou Starter)

3. Clique **Create Web Service**.

4. Une fois le déploiement terminé, ouvre l’URL Render.
   Le frontend charge, le système de clés fonctionne, et le LIVE utilise les données mock.

## Données Telegram (important)

Actuellement les jeux sont **mockés** dans `server.js` (`MOCK_GAMES`).

Pour brancher le vrai canal `@statistika_baccara` :

1. Choisis une méthode d’accès Telegram (bot, gramjs, Telethon, etc.).
2. Remplace les deux fonctions :
   - `fetchTelegramHistory()`
   - `fetchLatestTelegramGame()`
3. Respecte le format de réponse attendu par le frontend (voir commentaires dans `server.js`).

> ⚠️ Le free tier de Render s’endort après ~15 min d’inactivité.
> Le scan LIVE 0,8 s ne restera donc pas vraiment permanent sur le plan gratuit.

## Clés d’abonnement

- Les clés restent définies côté client (comme dans l’original).
- Le backend reçoit uniquement le **hash** et empêche la réutilisation.
- Les hashes utilisés sont stockés dans `data/used-keys.json` (fichier local).
  Sur le plan Free de Render le disque est éphémère → au redémarrage les clés “utilisées” sont oubliées.
  Pour un vrai usage permanent, branche une base (Postgres gratuit Render, Redis, etc.).

## Test local

```bash
cd morgan-bacc-render
npm install
npm start
# → http://localhost:3000
```

## Notes

- CORS est activé.
- Le frontend d’origine n’a presque pas été modifié.
- Mode OPTION 1 est activé par défaut + LIVE auto au chargement.
