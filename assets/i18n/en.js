/* Interface labels of the site (English). MIT License — Copyright (c) 2026 CCoupel.
   Same keys and same {parameters} as assets/i18n/fr.js (checked by tools/validate.js). A missing key falls back to French.
   The text of the slides (modules/*.js) is the PowerPoint text, already English: it is never translated.
   Terminology: docs/i18n/glossary.md. */
COURSE.i18n = COURSE.i18n || {};
COURSE.i18n['en'] = {
  'course.title': 'Ansible Training',
  'course.subtitle': 'Automation for everyone',
  'course.brand': 'Ansible Training',

  'nav.sidebar': 'Contents',
  'nav.home': 'Home',
  'nav.menu': 'Contents (m)',
  'nav.theme': 'Theme (t)',
  'nav.themeAria': 'Change theme',
  'nav.notes': 'Notes (n)',
  'nav.notesAria': 'Show or hide the trainer notes',
  'nav.prev': '← Previous',
  'nav.next': 'Next →',
  'nav.start': 'Start →',
  'nav.nextModule': 'Module {num} →',
  'nav.lang': 'Language (l)',
  'nav.langAria': 'Language: français',
  'nav.hint': '← → navigate · m contents · n notes · t theme · l language · / search',
  'nav.soon': 'soon',

  'lang.labelFr': 'Français',
  'lang.labelEn': 'English',

  'search.placeholder': 'Search ( / )',
  'search.aria': 'Search the course',
  'search.empty': 'No results.',

  'day.J1': 'Day 1',
  'day.J2': 'Day 2',
  'day.J3': 'Day 3',
  'day.J4': 'Day 4',

  'home.kicker': 'Ansible',
  'home.version': 'Version',
  'home.delivery': 'Delivery',
  'home.reference': 'Reference: ansible-core {core}',
  'home.python': 'Controller Python ≥ {python}',
  'home.modulesLoaded': '{done} of {total} module(s) available · {seen} slide(s) viewed',
  'home.start': 'Start the course',
  'home.resume': 'Resume: {title}',
  'home.reset': 'Reset my progress',
  'home.resetConfirm': 'Erase progress, quiz scores and preferences?',
  'home.module': 'Module',
  'home.soon': 'Soon',
  'home.download': 'Download the PowerPoint deck (same version)',
  'home.downloadHint': 'The link works from a clone of the repository, the published site or the release zip (the file sits next to index.html).',

  'cover.module': 'Module',
  'cover.objectives': 'Objectives',
  'cover.slides': '{n} slide(s)',
  'cover.quiz': '{n} quiz(zes)',
  'recap.title': 'Key takeaways',
  'recap.score': 'Module quiz: {score} / {total}',

  'badge.pptxTitle': 'Traceability: slide(s) of the PowerPoint deck',
  'badge.pptx': 'PPTX · slide {n}',
  'badge.pptxMany': 'PPTX · slides {list}',
  'badge.extra': 'HTML bonus',
  'badge.extraNote': 'not in the PPTX — additional content derived from the deck',
  'badge.ref': 'slide {list}',
  'badge.refMany': 'slides {list}',
  'notes.title': 'Trainer notes',

  'block.copy': 'Copy',
  'block.copied': 'Copied ✓',
  'block.reveal': 'Show the solution',
  'block.redo': 'Try again',
  'block.unknown': 'Unknown block: {type}',

  'icon.home': '🏠',
  'icon.objectives': '🎯',
  'icon.recap': '✅',
  'icon.score': '🎯',
  'icon.quiz': '🎯',
  'icon.lab': '🧪',
  'icon.download': '⬇️',

  'callout.tip': 'Tip',
  'callout.warn': 'Warning',
  'callout.trap': 'Pitfall',
  'callout.note': 'Note',
  'callout.awx': 'AWX / automation controller'
};
