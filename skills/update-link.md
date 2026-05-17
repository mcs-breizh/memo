---
model: claude-haiku-4-5-20251001
---

# Skill : Mettre à jour un lien existant

## Modèle recommandé
Haiku (`claude-haiku-4-5-20251001`) — tâche de recherche et de modification dans les données JSON.

## Objectif
Modifier un lien existant dans `data/links.json` : changer son statut de lecture, ajouter des notes, modifier le résumé, ou gérer ses tags.

## Procédure

### 1. Identification du lien
L'utilisateur décrit le lien à modifier par l'un des moyens suivants :
- Titre ou mots-clés du titre
- Tags associés
- Mots-clés du résumé
- Identifiant (`id`)

### 2. Recherche dans links.json
Lire `data/links.json`. Consulter `data/links.example.json` pour rappel du schéma si besoin.

Effectuer une recherche **souple** (correspondance partielle, insensible à la casse) sur les champs :
- `title`
- `summary`
- `tags`
- `id`

### 3. Sélection du lien
- **Un seul résultat** : afficher le lien trouvé et demander confirmation que c'est bien le bon.
- **Plusieurs résultats** : présenter la liste (id + titre) et demander à l'utilisateur de préciser lequel modifier.
- **Aucun résultat** : informer l'utilisateur et lui proposer d'affiner sa recherche.

### 4. Modifications possibles
Proposer ou appliquer les modifications suivantes selon la demande de l'utilisateur :

#### Marquer comme lu
- Passer `status` à `"read"`
- Renseigner `read_at` avec la date/heure courante en UTC, format ISO 8601 (ex: `"2026-05-17T14:30:00Z"`)

#### Marquer comme non-lu
- Passer `status` à `"unread"`
- Passer `read_at` à `null`

#### Ajouter ou modifier des notes
- Remplacer le champ `notes` par le texte fourni par l'utilisateur
- Les notes peuvent être vides (`""`)

#### Modifier le résumé
- Remplacer le champ `summary` par le nouveau résumé fourni ou généré
- Le résumé doit rester en français, 2-3 phrases

#### Ajouter ou retirer des tags
- Lire `data/tags.json` pour vérifier l'existence des tags
- Pour ajouter un tag : vérifier qu'il existe dans `data/tags.json` ; si non, demander confirmation à l'utilisateur avant de l'ajouter au référentiel
- Pour retirer un tag : retirer le slug du tableau `tags` du lien
- Respecter la limite de **4 tags maximum** par lien
- Slugs de tags : ASCII uniquement, lowercase, tirets

### 5. Confirmation avant écriture
Avant d'écrire les modifications, afficher un récapitulatif des changements :

```
Lien    : <titre>
Champs modifiés :
  - status  : <ancienne valeur> → <nouvelle valeur>
  - notes   : <aperçu>
  - tags    : <ancienne liste> → <nouvelle liste>
  ...
```

Demander confirmation explicite à l'utilisateur.

### 6. Mise à jour de links.json
Réécrire `data/links.json` avec le lien modifié (tous les autres liens restent inchangés). Ne modifier que les champs concernés par la demande.

### 7. Mise à jour de tags.json (si applicable)
Si de nouveaux tags ont été confirmés lors de l'étape 4, les ajouter à `data/tags.json` avec leur label affiché.

### 8. Commit et push

```bash
git add data/links.json data/tags.json
git commit -m "update: <titre du lien modifié>"
git push -u origin <branche-courante>
```

## Contraintes générales
- Maximum 4 tags par lien
- Ne jamais modifier le frontend (HTML/JS/CSS)
- Ne jamais modifier les champs `id`, `url`, `added_at` d'un lien existant
