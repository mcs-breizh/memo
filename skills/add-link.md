---
model: claude-haiku-4-5-20251001
---

# Skill : Ajouter un ou plusieurs liens

## Modèle recommandé
Haiku (`claude-haiku-4-5-20251001`) — tâche de fetch, résumé et suggestion de tags.

## Objectif
Ajouter un ou plusieurs nouveaux liens à la base de veille (`data/links.json`) en générant automatiquement un résumé, en suggérant des tags pertinents et en maintenant le référentiel de tags (`data/tags.json`).

## Procédure

### 1. Récupération des URLs
L'utilisateur fournit une ou plusieurs URLs. Traiter chaque URL séquentiellement (les unes après les autres) pour permettre la validation au fil de l'eau.

### 2. Fetch du contenu
Pour chaque URL, récupérer le contenu de la page avec l'outil `WebFetch`. Extraire :
- Le titre de la page (balise `<title>` ou `<h1>` principal)
- Le contenu textuel principal (ignorer navigation, footer, publicités)

### 3. Génération du résumé
À partir du contenu récupéré, rédiger un résumé en français de 2 à 3 phrases. Le résumé doit :
- Décrire le contenu principal de l'article
- Mettre en valeur l'intérêt ou l'apport de l'article
- Être rédigé dans un style neutre et informatif
- Ne pas dépasser 3 phrases

### 4. Consultation du référentiel de tags
Lire `data/tags.json` pour connaître les tags existants et leurs labels affichés.
Consulter `data/links.example.json` pour rappel du schéma si besoin.

### 5. Suggestion de tags
Proposer une sélection de **4 tags maximum** combinant :
- Des tags **existants** pertinents issus de `data/tags.json`
- Des tags **nouveaux** si le contenu s'y prête, pour enrichir le référentiel

Objectif : maintenir un référentiel de tags riche et précis. Même si des tags existants conviennent, proposer des nouveaux tags plus précis si le contenu le justifie.

Format des slugs de nouveaux tags : ASCII uniquement, lowercase, tirets (ex: `engineering-culture`, `developer-experience`).

### 6. Demande de confirmation à l'utilisateur
Présenter à l'utilisateur pour validation :

```
Titre      : <titre détecté>
Résumé     : <résumé généré>
Tags       : <tag1>, <tag2>, <tag3> (+ nouveaux : <new-tag> → "Label affiché")
```

Inviter l'utilisateur à :
- Valider ou corriger le titre
- Valider ou corriger le résumé
- Valider ou ajuster les tags (existants et nouveaux)

Attendre la confirmation explicite avant de continuer.

### 7. Mise à jour de tags.json
Si l'utilisateur confirme des nouveaux tags, les ajouter à `data/tags.json` :
- Clé : slug (ASCII, lowercase, tirets)
- Valeur : label affiché en français (confirmer le label avec l'utilisateur si nécessaire)

### 8. Génération de l'id
Construire l'id au format `YYYYMMDD-slug` :
- `YYYYMMDD` : date du jour au moment de l'ajout
- `slug` : dérivé du titre, **max 5 mots**, lowercase, tirets, **ASCII uniquement**
  - Translittérer les accents : `é→e`, `è→e`, `ê→e`, `à→a`, `â→a`, `ç→c`, `ü→u`, `ô→o`, `î→i`, `ù→u`, etc.
  - Supprimer les mots vides (le, la, les, de, du, des, un, une, and, the, of…)
  - Exemple : "L'avenir de l'IA générative" → `avenir-ia-generative`

### 9. Ajout dans links.json
Lire `data/links.json`, ajouter l'objet suivant à la fin du tableau, puis réécrire le fichier :

```json
{
  "id": "<YYYYMMDD-slug>",
  "url": "<url>",
  "title": "<titre validé>",
  "summary": "<résumé validé>",
  "tags": ["<tag1>", "<tag2>"],
  "status": "unread",
  "notes": "",
  "added_at": "<date-heure ISO 8601 courante>",
  "read_at": null
}
```

Contraintes :
- `status` : toujours `"unread"` à l'ajout
- `notes` : toujours `""` à l'ajout
- `read_at` : toujours `null` à l'ajout
- `added_at` : date/heure courante en UTC, format ISO 8601 (ex: `"2026-05-17T14:30:00Z"`)

### 10. Commit et push
Une fois tous les liens ajoutés :

```bash
git add data/links.json data/tags.json
git commit -m "add: <titre(s) du ou des liens ajoutés>"
git push -u origin <branche-courante>
```

## Contraintes générales
- Maximum 4 tags par lien
- Ne jamais modifier le frontend (HTML/JS/CSS)
- En cas d'erreur de fetch, signaler à l'utilisateur et proposer de saisir manuellement le titre et le résumé
