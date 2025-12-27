# Contributions et Évaluations

---

## Gabriel de Souza Morais

### Contributions Techniques

1. Mise en place du front-end (Vue 3 + Vite + TypeScript)
2. Intégration de la carte Leaflet pour la prise en charge de la position de l'utilisateur
3. Mise en place du système de prise de photos côté front-end
4. XP avec Steevy pour les premiers tests des inputs et le début des tests de l'API météo
5. Finalisation des tests de l'API météo
6. Implémentation de tests pour les appels à la base de données
7. Implémentation de tests pour les routes REST
8. Branchement du back-end et du front-end
9. XP avec Steevy pour implementer l'architecture hexagonal
10. Mise en place Docker (Dockerfile, docker-compose, orchestration)

### Auto-évaluation

**Points forts** : J'ai réussi à construire une interface frontend moderne et réactive avec Vue 3, en intégrant efficacement Leaflet pour la géolocalisation et la visualisation cartographique. Ma contribution majeure a été la mise en place complète de l'infrastructure Docker qui facilite le déploiement et l'onboarding des développeurs. Les sessions de pair programming avec Steevy ont été très enrichissantes, notamment pour comprendre et implémenter l'architecture hexagonale côté backend. J'ai également développé une solide compétence en tests d'intégration, couvrant les routes REST et les appels à la base de données.

**Difficultés rencontrées** : L'architecture hexagonale a représenté un défi important au début, nécessitant plusieurs refactorings pour bien saisir la séparation stricte entre les couches domain, application et infrastructure. La mise en place de tests avec NestJS a été particulièrement difficile. Comprendre le système de modules et le mocking des dépendances avec Vitest a demandé beaucoup d'apprentissage. La synchronisation des types TypeScript entre frontend et backend a également demandé une attention constante pour éviter les incohérences. J'ai aussi rencontré des difficultés avec la gestion des états asynchrones et le cache avec TanStack Query, notamment pour gérer correctement les erreurs et les états de chargement. Un point à améliorer serait d'augmenter la couverture de tests unitaires côté frontend.

### Évaluation par Steevy

**Note : [À COMPLÉTER PAR STEEVY]/20**

**Commentaire** : [À COMPLÉTER PAR STEEVY - Points forts, contributions remarquables, qualités professionnelles, axes d'amélioration]

---

## Hoareau Steevy

### Contributions Techniques

1. Mise en place du backend (NestJS + Architecture hexagonale)
2. Initial Setup du framework de test (Vitest + MongoDB Memory Server)
3. XP avec Gabriel pour l'intégration frontend-backend
4. Fix d'un bug critique d'injection de dépendance dû au bundler
5. Red tests pour la création d'un score utilisateur (approche TDD)
6. Implémentation de l'analyse de sentiment par photo avec Gemini Vision API
7. Mécanisme de fallback basé sur des mots-clés pour l'analyse de texte
8. Validation de schéma avec la librairie Effect pour type-safety maximale
9. Mise en place des repositories MongoDB avec Mongoose
10. Configuration des use cases et orchestration de la logique métier

### Auto-évaluation

**Points forts** : [À COMPLÉTER PAR STEEVY - 2-3 lignes sur ses forces : architecture hexagonale, backend, Gemini AI, tests, qualités démontrées]

**Difficultés rencontrées** : [À COMPLÉTER PAR STEEVY - 2-3 lignes sur les défis rencontrés : bugs complexes, équilibrage architecture/simplicité, APIs externes, points à améliorer]

### Évaluation par Gabriel

**Note : 19/20**

**Commentaire** : Steevy a démontré une maîtrise exceptionnelle de l'architecture hexagonale et des principes de Clean Code tout au long du projet. Son implémentation du backend avec NestJS est solide, parfaitement structurée et très bien testée. L'intégration de Gemini AI pour l'analyse de sentiment par photo et texte est particulièrement impressionnante, avec un système de fallback intelligent qui garantit la robustesse du service. Sa rigueur dans l'approche TDD et sa capacité à débugger des problèmes complexes (comme le bug d'injection de dépendance lié au bundler) ont été essentielles au succès du projet. Les sessions de pair programming ont été très enrichissantes grâce à sa patience et sa capacité à expliquer clairement les concepts complexes. L'utilisation d'Effect Schema pour la validation démontre sa recherche constante de solutions modernes et type-safe. Point d'amélioration : parfois, certaines abstractions pourraient être simplifiées pour des cas d'usage plus simples, afin d'équilibrer rigueur architecturale et pragmatisme.

---

## Synthèse de l'Équipe

### Points Forts Collectifs

- **Collaboration efficace** : Communication fluide et sessions de pair programming productives
- **Complémentarité** : Expertise frontend (Gabriel) et backend (Steevy) bien équilibrée
- **Qualité du code** : Standards élevés maintenus tout au long du projet
- **Architecture** : Implémentation rigoureuse de l'architecture hexagonale
- **Tests** : Couverture de tests complète (~75% backend)
- **Documentation** : README détaillé, schémas clairs, commentaires pertinents
- **DevOps** : Environnement Docker facilitant le déploiement

### Axes d'Amélioration

- **Tests frontend** : Augmenter la couverture de tests des composants Vue
- **Planification** : Mieux anticiper les dépendances externes et leurs limitations

---

**Note Globale de l'Équipe : 20/20**

L'équipe a démontré une excellente synergie, une maîtrise technique solide et une capacité à livrer un projet de qualité professionnelle respectant les principes de Clean Code et d'architecture logicielle.
