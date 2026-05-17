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

### 2. Accès au contenu de la page

Pour chaque URL, tenter d'accéder au contenu dans l'ordre suivant. Passer à l'étape suivante **uniquement si la précédente échoue** (erreur réseau, page inaccessible, contenu vide ou insuffisant).

**a) Accès direct**
Utiliser `WebFetch` sur l'URL originale.

**b) Cache Google**
Utiliser `WebFetch` sur : `https://webcache.googleusercontent.com/search?q=cache:<URL>`

**c) Wayback Machine**
Utiliser `WebFetch` sur : `https://web.archive.org/web/<URL>`
(Wayback Machine renvoie automatiquement la capture la plus récente disponible.)

**d) Recherche web**
Utiliser `WebSearch` avec le titre de la page ou des mots-clés représentatifs pour trouver une description ou un résumé de l'article.

**e) Demande à l'utilisateur**
Si toutes les approches précédentes échouent, demander à l'utilisateur :
- soit le **PDF de la page** (à lire avec l'outil `Read`)
- soit le **titre exact et un résumé** qu'il rédige lui-même

Extraire à partir du contenu obtenu :
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
  "notes": ""
}
```

Contraintes :
- `status` : toujours `"unread"` à l'ajout
- `notes` : toujours `""` à l'ajout

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
- En cas d'échec d'accès au contenu, suivre la chaîne de fallback définie à l'étape 2
