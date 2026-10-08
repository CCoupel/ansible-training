/* Libellés de l'interface du site (français). MIT License — Copyright (c) 2026 CCoupel.
   Tous les textes d'interface sont ici (jamais en dur dans engine.js / index.html) : la traduction
   de l'interface (#51) : assets/i18n/en.js porte les mêmes clés et les mêmes paramètres (contrôlé par tools/validate.js).
   Le contenu des slides (modules/*.js) n'est PAS traduit : il reprend le texte du support PowerPoint.
   Paramètres : {nom} remplacé à l'affichage ; clés vérifiées par tools/validate.js. */
COURSE.i18n = COURSE.i18n || {};
COURSE.i18n['fr'] = {
  'course.title': 'Ansible Training',
  'course.subtitle': 'Automation for everyone',
  'course.brand': 'Ansible Training',

  'nav.sidebar': 'Sommaire',
  'nav.home': 'Accueil',
  'nav.menu': 'Sommaire (m)',
  'nav.theme': 'Thème (t)',
  'nav.themeAria': 'Changer de thème',
  'nav.notes': 'Notes (n)',
  'nav.notesAria': 'Afficher ou masquer les notes du formateur',
  'nav.prev': '← Précédent',
  'nav.next': 'Suivant →',
  'nav.start': 'Commencer →',
  'nav.nextModule': 'Module {num} →',
  'nav.lang': 'Langue (l)',
  'nav.langAria': 'FR | EN — langue : English',
  'nav.hint': '← → naviguer · m sommaire · n notes · t thème · l langue · / recherche',
  'nav.soon': 'à venir',

  'lang.labelFr': 'Français',
  'lang.labelEn': 'English',

  'search.placeholder': 'Rechercher ( / )',
  'search.aria': 'Rechercher dans le cours',
  'search.empty': 'Aucun résultat.',

  'day.J1': 'Jour 1',
  'day.J2': 'Jour 2',
  'day.J3': 'Jour 3',
  'day.J4': 'Jour 4',

  'home.kicker': 'Ansible',
  'home.version': 'Version',
  'home.delivery': 'Livraison',
  'home.reference': 'Référence : ansible-core {core}',
  'home.python': 'Python contrôleur ≥ {python}',
  'home.modulesLoaded': '{done} module(s) disponible(s) sur {total} · {seen} slide(s) vue(s)',
  'home.start': 'Commencer le cours',
  'home.resume': 'Reprendre : {title}',
  'home.reset': 'Réinitialiser ma progression',
  'home.resetConfirm': 'Effacer la progression, les scores de quiz et les préférences ?',
  'home.module': 'Module',
  'home.soon': 'À venir',
  'home.download': 'Télécharger le support PowerPoint (même version)',
  'home.downloadHint': 'Le lien fonctionne depuis un clone du dépôt, le site publié ou le zip de la release (fichier à côté de index.html).',

  'cover.module': 'Module',
  'cover.objectives': 'Objectifs',
  'cover.slides': '{n} slide(s)',
  'cover.quiz': '{n} quiz',
  'recap.title': 'À retenir',
  'recap.score': 'Quiz du module : {score} / {total}',

  'badge.pptxTitle': 'Traçabilité : slide(s) du support PowerPoint',
  'badge.pptx': 'PPTX · slide {n}',
  'badge.pptxMany': 'PPTX · slides {list}',
  'badge.extra': 'Bonus HTML',
  'badge.extraNote': 'hors PPTX — contenu additionnel dérivé du support',
  'badge.ref': 'slide {list}',
  'badge.refMany': 'slides {list}',
  'notes.title': 'Notes du formateur',

  'block.copy': 'Copier',
  'block.copied': 'Copié ✓',
  'block.reveal': 'Voir la solution',
  'block.revealSlide': 'Voir la solution (slide {n})',
  'block.lab': 'À réaliser',
  'block.redo': 'Recommencer',
  'block.unknown': 'Bloc inconnu : {type}',

  'icon.home': '🏠',
  'icon.objectives': '🎯',
  'icon.recap': '✅',
  'icon.score': '🎯',
  'icon.quiz': '🎯',
  'icon.lab': '🧪',
  'icon.download': '⬇️',

  'callout.tip': 'Astuce',
  'callout.warn': 'Attention',
  'callout.trap': 'Piège',
  'callout.note': 'Note',
  'callout.awx': 'AWX / automation controller'
};
