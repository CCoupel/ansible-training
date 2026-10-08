/* Manifeste du plan de formation — voir CONVENTIONS.md et docs/PLAN.md.
   Source du sommaire et de l'agenda de l'accueil. Un module listé ici mais non chargé (pas de <script> dans
   index.html) s'affiche « à venir » (grisé, non ouvrable).
   day   : jour de l'agenda (slide 3 du PPTX) — J1 à J4 ; libellés dans assets/i18n/fr.js (clés day.*).
   range : première et dernière slide PPTX du module (slides masquées incluses) ; contrôlé par tools/validate.js. */
COURSE.plan = [
  { num: 1,  id: 'm01', emoji: '🚀', title: 'Introduction',             day: 'J1', range: [4, 12] },
  { num: 2,  id: 'm02', emoji: '📇', title: 'Inventory',                day: 'J1', range: [13, 29] },
  { num: 3,  id: 'm03', emoji: '📜', title: 'Playbooks',                day: 'J1', range: [30, 43] },
  { num: 4,  id: 'm04', emoji: '🧩', title: 'Modules',                  day: 'J1', range: [44, 55] },
  { num: 5,  id: 'm05', emoji: '🔣', title: 'Variables & facts',        day: 'J1', range: [56, 67] },
  { num: 6,  id: 'm06', emoji: '🚨', title: 'Errors & delegation',      day: 'J1', range: [68, 81] },
  { num: 7,  id: 'm07', emoji: '🧪', title: 'Filters & conditions',     day: 'J2', range: [82, 98] },
  { num: 8,  id: 'm08', emoji: '🔁', title: 'Loops & tags',             day: 'J2', range: [99, 119] },
  { num: 9,  id: 'm09', emoji: '🧾', title: 'Templates & async',        day: 'J2', range: [120, 134] },
  { num: 10, id: 'm10', emoji: '🔒', title: 'Vault',                    day: 'J2', range: [135, 141] },
  { num: 11, id: 'm11', emoji: '📦', title: 'Roles, collections & Galaxy', day: 'J3', range: [142, 161] },
  { num: 12, id: 'm12', emoji: '🛠️', title: 'Extend Ansible',           day: 'J3', range: [162, 182] },
  { num: 13, id: 'm13', emoji: '🐳', title: 'Execution Environments',   day: 'J3', range: [183, 192] },
  { num: 15, id: 'm15', emoji: '🌐', title: 'Real use case',            day: 'J4', range: [193, 202] },
  { num: 16, id: 'm16', emoji: '✅', title: 'Best practices',           day: 'J4', range: [203, 226] },
  { num: 17, id: 'm17', emoji: '🔗', title: 'Automation integration',   day: 'J4', range: [227, 233] }
];
