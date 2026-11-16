# BEL AVIATION & LOGISTICS — site statique

Version statique (HTML5 / CSS3 / JavaScript / Bootstrap 5) du site PHP + MySQL d'origine.
La feuille de style `assets/css/site.css`, le script `assets/js/site.js` et toutes les images sont **identiques** à ceux du projet d'origine.

## Utilisation en local
Double-cliquer sur `index.html`, ou lancer un petit serveur :

    python -m http.server 8000      # puis http://localhost:8000

Bootstrap, Bootstrap Icons, Swiper, GSAP, Anime.js et SweetAlert2 sont chargés depuis le CDN jsDelivr (comme dans la version d'origine) : une connexion Internet est nécessaire pour l'affichage complet.

## Publication sur GitHub Pages
1. Créer un dépôt GitHub et y envoyer **le contenu de ce dossier** (le fichier `index.html` à la racine du dépôt).
2. Dépôt → *Settings* → *Pages* → *Deploy from a branch* → branche `main`, dossier `/ (root)`.
3. Le site est alors disponible sur `https://<compte>.github.io/<depot>/`.
Tous les liens sont relatifs : le site fonctionne dans un sous-dossier comme à la racine d'un domaine. `.nojekyll` désactive le traitement Jekyll ; `404.html` sert de page d'erreur.

## Correspondance avec la version dynamique
| Version PHP / MySQL | Version statique |
|---|---|
| `index.php`, `company.php`, `services.php`, `network.php`, `blog.php`, `contact.php`, `partners.php` | `index.html`, `company.html`, … (mêmes noms en `.html`) |
| `service.php?slug=X` (table `services`) | `service-X.html` (une page par service publié) |
| `article.php?slug=X` (table `blog_posts`, statut *published*) | `article-X.html` |
| Réglages du site (logo, WhatsApp, réseaux sociaux) | intégrés dans l'en-tête et le pied de page |
| Administration, base de données, statistiques de visiteurs | non repris (voir ci-dessous) |

## Ce qui change forcément en statique
- **Formulaire de contact et commentaires** : plus d'enregistrement en base. Par défaut, le formulaire valide les champs (mêmes règles que le PHP) puis ouvre la messagerie du visiteur avec la demande pré-remplie (`bdm@belaviation.cm`). Pour un envoi sans messagerie, créer un formulaire sur Formspree (ou équivalent) et renseigner son URL dans `formEndpoint` en haut de `assets/js/static-forms.js`.
- **« J'aime »** : compteur enregistré uniquement dans le navigateur du visiteur.
- **Modifier le contenu** : éditer directement les fichiers HTML. Pour ajouter un service ou un article, dupliquer `service-….html` / `article-….html` puis ajouter sa carte dans `services.html` / `blog.html`.
- **Réseaux sociaux** : les URL Facebook, Instagram et LinkedIn étaient vides dans la base ; les icônes du pied de page pointent donc vers `#`. Les remplacer dans le pied de page de chaque page.

## Confidentialité
Les tables `admins` (mots de passe hachés), `contact_messages`, `visitor_*`, `activity_logs`, `security_*` et `mail_settings` n'ont **pas** été exportées. Ne jamais publier le fichier `.sql` : il est exclu par `.gitignore`.
