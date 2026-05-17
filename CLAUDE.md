# memo — Gestionnaire de veille personnel

Site statique servi par GitHub Pages. Les données de veille (liens, tags) sont stockées en JSON dans `data/`. Il n'y a pas de backend : le frontend lit directement les fichiers JSON.

## Structure du repo

```
memo/
├── data/
│   ├── links.json           # Base de liens (tableau JSON)
│   ├── tags.json            # Référentiel de tags (objet clé-valeur)
│   ├── links.example.json   # Schéma de référence pour un lien (ne pas modifier)
│   └── tags.example.json    # Schéma de référence pour les tags (ne pas modifier)
├── skills/
│   ├── add-link.md          # Skill : ajouter un ou plusieurs liens
│   └── update-link.md       # Skill : mettre à jour un lien existant
├── CLAUDE.md                # Ce fichier
├── README.md
└── LICENSE
```

## Schéma des données

Les schémas de référence complets sont dans `data/links.example.json` et `data/tags.example.json`. Consulter ces fichiers au besoin (lazy loading de contexte) plutôt que de les reproduire ici.

## Skills disponibles

- **Ajouter un lien** → suivre `skills/add-link.md`
- **Mettre à jour un lien** → suivre `skills/update-link.md`

## Règles globales

- Pour les tâches de génération de résumés et suggestion de tags, utiliser le modèle **Haiku** (`claude-haiku-4-5-20251001`).
- Toujours **commit et push** après toute modification des fichiers dans `data/`.
- Ne jamais modifier le frontend (HTML/JS/CSS) sans instruction explicite de l'utilisateur.
