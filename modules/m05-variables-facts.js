/* Module 05 — Variables & facts (slides PPTX 56 à 67). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm05', num: 5, emoji: '🔣',
  title: 'Variables & facts',
  tagline: 'Définir et utiliser des variables, comprendre leur précédence et exploiter les facts.',
  objectives: [
    { html: 'Définir une variable : une valeur réutilisable dans les playbooks et les rôles.', ref: [57] },
    { html: 'Citer les types de variables : de playbook, d\'inventaire, de rôle et extra variables passées en ligne de commande.', ref: [57] },
    { html: 'Utiliser des variables de type chaîne, entier, tableau et dictionnaire dans un playbook.', ref: [59] },
    { html: 'Déterminer la valeur d\'une variable définie à plusieurs niveaux grâce à l\'ordre de précédence.', ref: [58, 60, 61] },
    { html: 'Lister les facts d\'un hôte et ajouter des facts personnalisés.', ref: [64, 65, 67] }
  ],
  slides: [
    { title: 'Variables and facts', src: [56],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html</a>' }
      ] },
    { title: 'Definition:', src: [57],
      blocks: [
        { t: 'bullets', items: ['used to store values that can be reused throughout your playbooks and roles.', 'Purpose:<ul><li>help in making automation scripts more flexible and dynamic by allowing to change values without modifying the entire script.</li></ul>', 'Types of Variables:<ul><li>Playbook Variables: Defined within a playbook.</li><li>Inventory Variables: Defined in the inventory file.</li><li>Role Variables: Defined within roles.</li><li>Extra Variables: Passed at runtime using the command line.</li></ul>', 'Usage:<ul><li>can be used to customize configurations, manage different environments, and handle sensitive data securely</li></ul>'] }
      ] },
    { title: 'Variables and facts : Ordering and precedence', src: [58],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Inventaire
Groups
Parent
Enfants (ordre alphabetique)
Host

Playbook
vars:
- mon_param: ma_Valeur
Set_facts:
	 mon_param: ma_Valeur

Command Line
ansible-playbook -i 127.0.0.1, -e mon_param1=ma_valeur1 playbook.yml` },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html#ansible-variable-precedence" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html#ansible-variable-precedence</a>' }
      ] },
    { title: 'Variables: examples', src: [59],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Vars:
 - my_string: "toto"
 - my_integer: 1234
 - my_array: ["qwert", "asdfg", "zxcvb"]
 - my_dict: { user: "toto", id: 1234, shell: "/sbin/bash"}

- name: Debug String and Int
  debug:
    msg: "{{ my_string }} {{ my_integer }}"

- name: Debug array
  debug:
    msg: "{{ my_array.0 }} {{ my_array[0] }}"

- name: Debug dict
  debug:
    msg: "{{ my_dict.user }} {{ my_dict['user'] }}"` }
      ] },
    { title: 'Variables', src: [60],
      blocks: [
        { t: 'code', lang: 'ini', code: `Variables-inventory.ini

[group]
SRV1 mon_param=set_by_host
SRV2

[group:vars]
 mon_param=set_in_group` },
        { t: 'code', lang: 'yaml', code: `Variables.yml

- name: Test
  hosts: all
  gather_facts: no
  connection: local
  vars:
  - mon_param: set_in_playbook
  - mon_param2: set_by_vecteur
  tasks:
  - name: facting
    set_fact:
      mon_param_0: "{{ inventory_hostname }}"
  - name: resultat
    debug:
      msg: "Parameter defined in {{ mon_param_0 }} - {{ mon_param }}"` }
      ] },
    { title: 'Exercice: variables', src: [61],
      blocks: [
        { t: 'lab', title: 'À réaliser', steps: ['- Identify precedence and priority of vars', '- What is the precedence ordering?'] },
        { t: 'code', lang: 'console', code: `ansible-playbook -i variables-inventory.ini variables.yml
ansible-playbook -i variables-inventory.ini -e mon_param=set_by_cli variables.yml
ansible-playbook -i variables-inventory.ini -e mon_param="{{ mon_param2 }}"  variables.yml` }
      ] },
    { title: 'Variables', src: [62],
      blocks: [
        { t: 'text', html: '<b>Magic variables:</b>' },
        { t: 'bullets', items: ['hostvars', 'group_names', 'groups', 'inventory_hostname', 'ansible_facts'] }
      ] },
    { title: 'Exercice: facts', src: [63, 66, 67],
      notes: ['Exemple fichier facts.d', 'Utilisation des variable "{{ nom }}"', 'hostvars[ inventory_hostname][\'ansible_default_ipv4\'][\'address\']', 'Ansible_facts[\'ansible_default_ipv4\'][\'address\']'],
      blocks: [
        { t: 'text', html: '<small>CONDITIONS</small>' },
        { t: 'lab', title: 'À réaliser', steps: ['- What are the default facts?', '- Add new facts like datacenter, project, environment, group', '- display the hostvars with gather_facts: no and yes', '- found the key in hostvars where the default ip is defined'] },
        { t: 'reveal', label: 'Voir la solution (slide 67)', html: '<pre>hostvars[ inventory_hostname] =&gt; ansible_facts [\'ansible_default_ipv4\'][\'address\']\nAnsible_facts[\'ansible_default_ipv4\'][\'address\']</pre>' }
      ] },
    { title: 'Facts:', src: [64],
      blocks: [
        { t: 'text', html: 'Group of facts/variables loaded from the remote hosts' },
        { t: 'code', lang: 'yaml', code: `- host: all
    gather_facts: true` },
        { t: 'code', lang: 'yaml', code: `- tasks:
    - setup:
        filter: ansible_*` }
      ] },
    { title: 'More Facts:', src: [65],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- tasks:
    - ansible.builtin.set_fact:
        my_fact: my_value` },
        { t: 'text', html: '-  facts in remote host:' },
        { t: 'code', lang: 'text', code: `/etc/ansible/facts.d/*.fact` },
        { t: 'text', html: 'Ini file: /etc/ansible/facts.d/fact_file.fact' },
        { t: 'code', lang: 'ini', code: `[my_category]
Key1=value1
Key2=value2` },
        { t: 'code', lang: 'jinja', code: `{{ ansible_local['fact_file']['my_category']['key1'] }}` },
        { t: 'code', lang: 'yaml', code: `- tasks:
    - ansible.builtin.include_vars:
        file: "{{ my_vars_file }}"
        name: my_value` }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quels types de variables la slide 57 distingue-t-elle ?',
        options: ['Playbook, inventaire, rôle et extra variables', 'Playbook, module, plugin et callback', 'Inventaire, collection, Galaxy et Vault'], answer: 0,
        explain: 'Slide 57 : « Playbook Variables », « Inventory Variables », « Role Variables » et « Extra Variables » (passées à l\'exécution en ligne de commande).', ref: [57] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Comment la slide 59 accède-t-elle au premier élément du tableau <code>my_array</code> ?',
        options: ['{{ my_array(0) }}', '{{ my_array.first }}', '{{ my_array[0] }} (ou {{ my_array.0 }})'], answer: 2,
        explain: 'La slide 59 affiche <code>{{ my_array.0 }}</code> et <code>{{ my_array[0] }}</code>.', ref: [59] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Où se placent les facts locaux sur l\'hôte distant ?',
        options: ['/var/lib/ansible/facts', '/etc/ansible/facts.d/*.fact', '/etc/ansible/hosts'], answer: 1,
        explain: 'Slide 65 : « facts in remote host: /etc/ansible/facts.d/*.fact ».', ref: [65] }
    ] }
  ],
  takeaways: [
    { html: 'Les variables stockent des valeurs réutilisables dans les playbooks et les rôles, ce qui rend l\'automatisation plus flexible et dynamique.', ref: [57] },
    { html: 'Les variables peuvent être définies dans un playbook, dans l\'inventaire, dans un rôle ou passées à l\'exécution avec les extra variables.', ref: [57] },
    { html: 'Une même variable peut être définie à plusieurs niveaux (inventaire, playbook, <code>set_fact</code>, ligne de commande) : l\'ordre de précédence détermine la valeur retenue.', ref: [58, 60] },
    { html: 'Les facts sont un groupe de variables chargées depuis les hôtes distants ; <code>setup</code> avec <code>filter</code> permet de les filtrer.', ref: [64] },
    { html: 'Les facts locaux se placent dans <code>/etc/ansible/facts.d/*.fact</code> et se lisent avec <code>ansible_local</code>.', ref: [65] },
    { html: 'Les variables magiques incluent <code>hostvars</code>, <code>group_names</code>, <code>groups</code>, <code>inventory_hostname</code> et <code>ansible_facts</code>.', ref: [62] }
  ]
});
