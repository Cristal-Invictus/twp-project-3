# Vue Trello - MVVM_TWP

> Une application de gestion de tâches style Trello utilisant Vue.js avec WordPress comme backend (Architecture MVVM_TWP)



# Membres de l'équipe
 > Orens TONON
 > Israel LAWANI
 > Cristal AKOYESSOU

## Fonctionnalités

- **Interface Kanban** avec drag & drop (À faire, En cours, Terminé)
- **Backend WordPress** via API REST pour la persistance des données
- **Gestion des tableaux** (catégories WordPress)
- **Gestion des tâches** (articles WordPress avec métadonnées)
- **Système de commentaires** sur les tâches
- **Interface responsive** adaptée aux mobiles
- **Notifications toast** et gestion d'erreurs avancée

## Technologies

- **Frontend**: Vue.js 2.6, Vue Router, SCSS
- **Backend**: WordPress avec API REST
- **HTTP Client**: Axios
- **UI/UX**: SweetAlert2, animations CSS, notifications toast
- **Drag & Drop**: vue-smooth-dnd

## Installation

### Prérequis
- Node.js 20+
- WordPress installé avec API REST activée

### 1. Installation du projet
```bash
git clone <repository>
cd vue-trello-clone
npm install
```

### 2. Configuration WordPress

1. **Activer l'API REST WordPress**
2. **Créer quelques catégories de test** dans WordPress
3. **Tester les endpoints** :
   - `GET /wp-json/wp/v2/categories`
   - `GET /wp-json/wp/v2/posts`

### 3. Lancement
```bash
npm run serve
```
### Flux principal
1. **Home** → Voir tous les tableaux (catégories WordPress)
2. **Créer un tableau** → Bouton FAB en bas à droite
3. **Clic sur tableau** → Ouvre le Board Kanban
4. **Gérer les tâches** → Créer, déplacer, modifier, supprimer
5. **Clic sur tâche** → Modal avec détails et commentaires

### Raccourcis
- **Ctrl + Entrée** : Envoyer un commentaire
- **Échap** : Fermer les modales
- **Drag & Drop** : Déplacer les tâches entre colonnes

## API WordPress utilisée

| Endpoint | Usage |
|----------|-------|
| `GET /wp-json/wp/v2/categories` | Récupérer les tableaux |
| `POST /wp-json/wp/v2/categories` | Créer un tableau |
| `GET /wp-json/wp/v2/posts?categories[]={id}` | Récupérer les tâches |
| `POST /wp-json/wp/v2/posts` | Créer une tâche |
| `GET /wp-json/wp/v2/comments?post={id}` | Récupérer les commentaires |

## Build

```bash
npm run build
```

## Scripts

```bash
npm run serve     # Développement
npm run build     # Production
npm run lint      # Vérification du code
```
---

**Architecture MVVM_TWP** - Model (WordPress) + View (Vue.js) + ViewModel (Services) + Two-Way Persistence

