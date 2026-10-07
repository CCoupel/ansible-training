/* Module 15 — Automation integration (slides PPTX 218 à 223). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm15', num: 15, emoji: '🔗',
  title: 'Automation integration',
  tagline: 'Respecter des règles d\'intégration pour des playbooks et des rôles utilisables par une plateforme d\'automatisation.',
  objectives: [
    { html: 'Appliquer les règles d\'intégration des playbooks : des groupes plutôt que des VM dans les listes d\'hôtes.', ref: [219] },
    { html: 'Documenter un playbook avec un README : vue d\'ensemble, prérequis, variables et exemple d\'utilisation.', ref: [220] },
    { html: 'Fournir les outils sous forme de rôle, avec des métadonnées <code>galaxy_info</code>.', ref: [221] },
    { html: 'Appliquer les règles « One for All » : aucun secret dans les rôles, variables internes préfixées, fichier <code>Sanity.yml</code>.', ref: [222] },
    { html: 'Organiser un rôle selon le modèle CRUD : <code>Create</code>, <code>Read</code>, <code>Update</code>, <code>Delete</code>.', ref: [223] }
  ],
  slides: [
    { title: 'Cas concret', src: [218],
      blocks: [
        { t: 'text', html: 'Automation Integration Rules' }
      ] },
    { title: 'Playbooks', src: [219],
      blocks: [
        { t: 'bullets', items: ['Don’t use VM in host lists, use group intersection<ul><li>Vms are grouped by solution/environment/function</li><li>Hosts: "&lt;solution&gt;:&amp;&lt;environment&gt;:&amp;&lt;function&gt;"</li></ul>', 'Don\'t reference environment variables', 'miq_action provides whether provisionning, retiring, reconfigurering', 'miq tags are available in<ul><li>miq_tags:{&lt;classification name&gt;:{\'name\': &lt;tag name&gt;, description\':&lt;tag description&gt;}}</li><li>Integration example (ManageIQ / CloudForms, legacy)</li></ul>'] }
      ] },
    { title: '# My Playbook: Network Tester', src: [220],
      blocks: [
        { t: 'code', lang: 'text', code: `================================
## Overview
This playbook tests network connectivity between two servers using a custom module.
## Requirements
* ansible-core 2.20 or later
* Python 3.12 or later (control node)
* The \`network_tester\` custom module (included in this repository)
## Role Variables
The following variables are required:
* \`src_server\`: The source server IP or hostname
* \`dst_server\`: The destination server IP or hostname
* \`protocol\`: The network protocol to use (TCP, UDP, etc.) (default: TCP)
Optional variables:
* \`connection_message\`: The connection message to send (default: "Hello, world!")
## Example Usage` }
      ] },
    { title: 'Roles', src: [221],
      blocks: [
        { t: 'bullets', items: ['tools should be as a Role', 'Meta information set for documentation'] },
        { t: 'code', lang: 'yaml', code: `galaxy_info:
  author: Your Name
  description: A brief description of the role
  company: Your Company (optional)
  license: license (e.g. GPLv3, MIT, etc.)
  min_ansible_version: "2.20"
  platforms:
    - name: EL
      versions:
        - "9"
    - name: Ubuntu
      versions:
        - jammy
        - noble
    - name: Debian
      versions:
        - bookworm
  galaxy_tags:
    - network
    - security
    - testing` },
        { t: 'code', lang: 'yaml', code: `role_vars:
    - src_server:
        description: The source server IP or hostname
        required: true
    - dst_server:
        description: The destination server IP or hostname
        required: true
    - protocol:
        description: The network protocol to use (TCP, UDP, etc.)
        required: true
        default: TCP
    - connection_message:
        description: The connection message to send
        required: false
        default: "Hello, world!"

dependencies: []` }
      ] },
    { title: 'One for All', src: [222],
      blocks: [
        { t: 'bullets', items: ['no secrets in the role/playbooks =&gt; VAULT'] },
        { t: 'text', html: '<b>fact naming conflicts:</b>' },
        { t: 'bullets', items: ['internal role vars should be like _&lt;role_name&gt;_&lt;var_name&gt;'] },
        { t: 'text', html: '<b>internal role vars MUST be declared in the default/main.yml and initialized from external role vars:</b>' },
        { t: 'bullets', items: ['_myRole_var1: myRole_var1|default("default_var")'] },
        { t: 'text', html: '<b>Sanity.yml:</b>' },
        { t: 'bullets', items: ['do some checks, assertion and validation of the extra vars and context', 'Use a dedicated fact to assert/validate role execution (&lt;role&gt;_execution: [true/false])', 'the main.yml  must call<ul><li>Sanity check files</li><li>the corresponding task files</li></ul>'] }
      ] },
    { title: 'Roles: CRUD structure', src: [223],
      blocks: [
        { t: 'bullets', items: ['It should be convenient to Implement a CRUD (Create, Read, Update, Delete)<ul><li>MyRole/<ul><li>vars/<ul><li>default.yml</li></ul></li><li>tasks/<ul><li>sanity.yml</li><li>main.yml</li><li>Create.yml</li><li>Read.yml</li><li>Update.yml</li><li>Delete.yml</li></ul></li></ul></li></ul>', 'Set well descriptive name for all tasks and plays', 'Avoid useless tasks, use conditions (when)', 'Use the handlers to avoid multiple runs of a single tache'] }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Où les variables internes d\'un rôle doivent-elles être déclarées ?',
        options: ['Dans default/main.yml, initialisées à partir des variables externes du rôle', 'Dans l\'inventaire uniquement', 'Sur la ligne de commande avec -e uniquement'], answer: 0,
        explain: 'Slide 222 : « internal role vars MUST be declared in the default/main.yml and initialized from external role vars ».', ref: [222] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quel mécanisme la slide 223 recommande-t-elle pour éviter plusieurs exécutions d\'une même tâche ?',
        options: ['Les handlers', 'ignore_errors', 'Les tags'], answer: 0,
        explain: 'Slide 223 : « Use the handlers to avoid multiple runs of a single tache ».', ref: [223] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que faut-il utiliser à la place des VM dans les listes d\'hôtes d\'un playbook ?',
        options: ['Une intersection de groupes', 'Une liste d\'adresses IP', 'Un fichier d\'inventaire par VM'], answer: 0,
        explain: 'Slide 219 : « Don’t use VM in host lists, use group intersection » ; les VM sont regroupées par solution, environnement et fonction.', ref: [219] }
    ] }
  ],
  takeaways: [
    { html: 'Ne pas utiliser des VM dans les listes d\'hôtes : utiliser l\'intersection de groupes (solution, environnement, fonction).', ref: [219] },
    { html: 'Ne pas référencer les variables d\'environnement.', ref: [219] },
    { html: 'Les outils doivent être fournis sous forme de rôle, avec des métadonnées pour la documentation (<code>galaxy_info</code>).', ref: [221] },
    { html: 'Aucun secret dans les rôles ou les playbooks : utiliser Vault.', ref: [222] },
    { html: 'Les variables internes d\'un rôle suivent le format <code>_&lt;role_name&gt;_&lt;var_name&gt;</code> et sont déclarées dans <code>default/main.yml</code>.', ref: [222] },
    { html: 'Utiliser des conditions pour éviter les tâches inutiles, et des handlers pour éviter les exécutions multiples d\'une même tâche.', ref: [223] }
  ]
});
