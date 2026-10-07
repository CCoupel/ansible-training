/* Module 08 — Loops & tags (slides PPTX 99 à 119). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm08', num: 8, emoji: '🔁',
  title: 'Loops & tags',
  tagline: 'Répéter des tâches avec les boucles et les exécuter sélectivement grâce aux tags.',
  objectives: [
    { html: 'Définir une boucle : exécuter une tâche plusieurs fois avec des éléments différents.', ref: [100] },
    { html: 'Écrire une boucle avec <code>loop</code> et utiliser l\'élément courant <code>item</code>.', ref: [101, 102] },
    { html: 'Combiner des listes avec <code>zip</code> et <code>product</code>.', ref: [103, 104] },
    { html: 'Contrôler une boucle avec <code>Loop_control</code> et la répéter avec <code>until</code>.', ref: [105, 106] },
    { html: 'Étiqueter des tâches avec <code>tags</code> et les exécuter ou les ignorer avec <code>--tags</code> et <code>--skip-tags</code>.', ref: [114, 116] }
  ],
  slides: [
    { title: 'Loops', src: [99],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_loops.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_loops.html</a>' }
      ] },
    { title: 'Loops: concepts', src: [100],
      blocks: [
        { t: 'bullets', items: ['Definition: Loops in Ansible allow you to execute a task multiple times with different items, making your playbooks more efficient and concise.', 'Purpose: They help automate repetitive tasks, reducing the need for manual intervention and minimizing errors.', 'Key Concepts:<ul><li>loop: The primary keyword for creating loops in Ansible.</li><li>with_items: An older syntax for loops, still supported but less recommended.</li><li>until: Used for retrying a task until a condition is met.</li></ul>', 'Benefits: Loops enhance the scalability and maintainability of your playbooks, allowing for more dynamic and flexible automation.'] }
      ] },
    { title: 'LOOP EXAMPLE', src: [101],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: install pkgs
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - rsyslog
    - chrony
    - bash-completion
    - screen

=> equivalent to with_items` }
      ] },
    { title: 'loop EXAMPLE', src: [102],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: setup myapp
  ansible.builtin.lineinfile:
    state: present
    path: /etc/myapp.cfg
    line: "{{ item['entry'] }} {{ item['column'] }}"
  loop:
  - { entry: image_path           , column: /opt/myapp/images }
  - { entry: local_ip             , column: "{{ deploy_network }}.35/24" }
  - { entry: network_gateway      , column: "{{ deploy_network }}.35" }
  - { entry: public_vip           , column: "{{ deploy_network }}.10" }
  - { entry: local_interface      , column: "eth0"}` }
      ] },
    { title: 'loop with together', src: [103],
      blocks: [
        { t: 'code', lang: 'yaml', code: `  vars:
    users:
      - user1
      - user2
      - user4
    groups:
      - group1
      - group2
      - group3

loop: "{{ users |zip(groups)|list}}"

item=['user1', 'group1']
item=['user2', 'group2']
item=['user3', 'group3']


=> equivalent à with_together` }
      ] },
    { title: 'loop with nested :', src: [104],
      blocks: [
        { t: 'code', lang: 'yaml', code: `  vars:
    users:
      - user1
      - user2
      - user3
    groups:
      - group1
      - group2
      - group3

loop: "{{ list1 |product(list2)|list}}"

item=['user1', 'group1']
item=['user1', 'group2']
item=['user1', 'group3']
item=['user2', 'group1']
item=['user2', 'group2']
item=['user2', 'group3']
item=['user3', 'group1']
item=['user3', 'group2']
item=['user3', 'group3']

=> equivalent à with_nested` }
      ] },
    { title: 'loop_control', src: [105],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Loop_control:
  pause: 3
  index_var: my_index
  loop_var: my_item` }
      ] },
    { title: 'loop DO-UNTIL', src: [106],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- shell: /usr/bin/foo
  register: result
  until: result.stdout.find("all systems go") != -1
  retries: 5
  delay: 10` }
      ] },
    { title: 'loop EXAMPLE: references', src: [107],
      blocks: [
        { t: 'code', lang: 'text', code: `So many maner to loop:
*Standard Loops	        	   *Nested Loops
*Looping over Hashes	       *Looping over Files
*Looping over Fileglobs	   *Looping over Parallel Sets of *Data
*Looping over Subelements	   *Looping over Integer Sequences
*Random Choices	            *Iterating Over The Results of a Program 							Execution
*Finding First Matched Files *Do-Until Loops
*Looping Over A List With    *Using ini file with a loop
 An Index
*Flattening A List	        *Using register with a loop
*Looping over the inventory  *Loop Control
*Loops and Includes in 2.0   *Writing Your Own Iterators` }
      ] },
    { title: 'EXERCICE', src: [108, 109, 110],
      notes: 'hostvars[inventory_hostname][\'ansible_default_ipv4\'][\'address\']',
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['- update /etc/hosts with ALL your servers<br>&lt;ip&gt; &lt;hostname&gt;', '- add a host GOOGLE.COM 8.8.8.8'] },
        { t: 'code', lang: 'jinja', code: `hostvars[inventory_hostname]['ansible_default_ipv4']['address']` },
        { t: 'reveal', label: 'Voir la solution (slide 109)', html: '<pre>---\n- name: Update /etc/hosts\n  hosts: all\n  become: yes\n  tasks:\n    - name: Update /etc/hosts with all servers and add/change GOOGLE.COM\n      lineinfile:\n        path: /etc/hosts\n        line: "{{ hostvars[item][\'ansible_default_ipv4\'][\'address\'] }} {{ item }}"\n      loop: "{{ groups[\'all\'] }}"</pre>' },
        { t: 'reveal', label: 'Voir la solution (slide 110)', html: '<pre>---\n- name: Update /etc/hosts\n  hosts: all\n  become: true\n  tasks:\n    - name: Update /etc/hosts with all servers and add/change GOOGLE.COM\n      ansible.builtin.lineinfile:\n        path: /etc/hosts\n        line: "{{ item.1 }} {{ item.0 }}"\n      loop: &gt;\n        {{\n          groups[\'all\'] | zip(groups[\'all\'] | map(\'extract\', hostvars, [\'ansible_default_ipv4\', \'address\']))\n          | list + [[\'google.com\', \'8.8.8.8\']]\n        }}\n - [\'node1.example.com\', \'192.0.2.139\']\n - [\'google.com\', \'8.8.8.8\']</pre>' }
      ] },
    { title: 'Exercice: host_groups', src: [111, 112],
      notes: 'Transpose into Inventory and hostvars:',
      blocks: [
        { t: 'code', lang: 'yaml', code: `host_groups:
      HG-1-DC1:
        - id: 1
          name: lun1
        - id: 2
          name: lun_18
      HG-2-DC1 :
        - id: 1
          name: lun_432
        - id: 2
          name: lun_123` },
        { t: 'lab', title: 'Exercice:', steps: ['Do  a playbook that loop over all', '- declare a fact &lt;id&gt;-&lt;name&gt;@&lt;parent_group_name&gt;', '- display the content of the fact'] },
        { t: 'reveal', label: 'Voir la solution (slide 112)', html: '<pre>---\n- hosts: localhost\n  gather_facts: no\n  tasks:\n    - name: Loop over host_groups and declare facts\n      set_fact:\n        custom_fact: "{{ item.1.id }}-{{ item.1.name }}@{{ item.0 }}"\n      loop: "{{ lookup(\'dict\', host_groups) }}"\n      register: custom_facts\n    - name: Display the content of the facts\n      debug:\n        msg: "{{ item.custom_fact }}"\n      loop: "{{ custom_facts.results }}"</pre>' }
      ] },
    { title: 'Tags', src: [113],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_tags.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_tags.html</a>' }
      ] },
    { title: 'Tags: concepts', src: [114],
      blocks: [
        { t: 'bullets', items: ['Definition: Tags in Ansible are used to label tasks, allowing you to selectively run or skip specific parts of your playbooks.', 'Purpose: They provide a way to manage and control the execution of tasks, making your automation scripts more modular and efficient.'] },
        { t: 'text', html: 'Save time by avoiding re-execution of already completed tasks.' },
        { t: 'text', html: 'Facilitate debugging by isolating specific sections of the playbook.' },
        { t: 'bullets', items: ['Key Concepts:<ul><li>Defining Tags: Assign tags to tasks using the tags keyword.</li><li>Running Tagged Tasks: Use the --tags option to run only tasks with specific tags.</li><li>Skipping Tagged Tasks: Use the --skip-tags option to skip tasks with specific tags.</li></ul>', 'Benefits: Tags enhance the flexibility and manageability of your playbooks, allowing for targeted execution and easier debugging.'] }
      ] },
    { title: 'How to Add Tags', src: [115],
      blocks: [
        { t: 'text', html: '<b>Adding tags to individual tasks:</b>' },
        { t: 'code', lang: 'yaml', code: `tasks:
  - name: Install Apache
    apt:
      name: apache2
      state: present
    tags:
      - installation
      - webserver` },
        { t: 'text', html: '<b>Adding tags to blocks of tasks:</b>' },
        { t: 'code', lang: 'yaml', code: `tasks:
  - block:
      - name: Install NTP
        apt:
          name: ntp
          state: present
      - name: Configure NTP
        template:
          src: ntp.conf.j2
          dest: /etc/ntp.conf
    tags:
      - ntp` }
      ] },
    { title: 'Using Tags', src: [116],
      blocks: [
        { t: 'text', html: '<b>Executing specific tasks with tags:</b>' },
        { t: 'text', html: 'Use the --tags option to execute only tasks marked with at least one specific tag.' },
        { t: 'code', lang: 'console', code: `ansible-playbook playbook.yml --tags "installation"` },
        { t: 'text', html: '<b>Skipping specific tasks with tags:</b>' },
        { t: 'text', html: 'Use the --skip-tags option to skip tasks marked with a specific tag.' },
        { t: 'code', lang: 'console', code: `ansible-playbook playbook.yml --skip-tags "configuration"` },
        { t: 'text', html: '<b>Using -tags and -skip-tags:</b>' },
        { t: 'text', html: 'When a task is tagged with both tags and skip-tags; the skip-tags take precedence and the task is skipped' }
      ] },
    { title: 'Special Tags', src: [117],
      blocks: [
        { t: 'text', html: '<b>Special tags in Ansible:</b>' },
        { t: 'bullets', items: ['always: Tasks tagged always are executed even when other tags are requested with --tags, unless skipped with --skip-tags always.', 'never: Tasks tagged never are only executed when explicitly requested with --tags never (or with another tag set on the same task).', 'tagged, untagged, all: special values of --tags / --skip-tags (not tags to set on tasks): tagged = tasks having at least one tag, untagged = tasks without tag, all = every task.'] },
        { t: 'text', html: '<b>Example</b>' },
        { t: 'code', lang: 'yaml', code: `tasks:
  - name: Task always executed
    ansible.builtin.command: echo "This task is always executed"
    tags:
      - always

  - name: Task never executed
    ansible.builtin.command: echo "This task is never executed"
    tags:
      - never

  - name: Task with tag web
    ansible.builtin.command: echo "This task has a tag"
    tags:
      - web` }
      ] },
    { title: 'CONDITIONS Exercice', src: [118, 119],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['- Create a playbook with the following tasks:<br>Install MySQL<br>Configure MySQL<br>Start the MySQL service', 'Add appropriate tags to each task.', 'Execute only the installation tasks using the tags.'] },
        { t: 'reveal', label: 'Voir la solution (slide 119)', html: '<pre>---\n- name: MySQL Deployment\n  hosts: databases\n  tasks:\n    - name: Install MySQL\n      apt:\n        name: mysql-server\n        state: present\n      tags:\n        - installation\n        - mysql\n    - name: Configure MySQL\n      template:\n        src: my.cnf.j2\n        dest: /etc/mysql/my.cnf\n      tags:\n        - configuration\n        - mysql\n    - name: Start MySQL service\n      service:\n        name: mysql\n        state: started\n      tags:\n        - service\n        - mysql\nSolution:\nansible-playbook playbook.yml --tags "installation"\nansible-playbook playbook.yml --skip-tags "configuration"\nExécuter uniquement les tâches d’installation :\nIgnorer les tâches de configuration :</pre>' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quel mot-clé est le principal pour créer une boucle ?',
        options: ['loop', 'with_items', 'until'], answer: 0,
        explain: 'Slide 100 : « loop: The primary keyword for creating loops in Ansible » ; <code>with_items</code> est une ancienne syntaxe moins recommandée et <code>until</code> sert à retenter une tâche.', ref: [100] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Que fait l\'option <code>--skip-tags</code> ?',
        options: ['Elle ignore les tâches portant le tag indiqué', 'Elle n\'exécute que les tâches portant le tag indiqué', 'Elle supprime le tag des tâches'], answer: 0,
        explain: 'Slide 116 : « Use the --skip-tags option to skip tasks marked with a specific tag ».', ref: [116] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quel tag spécial s\'exécute même quand d\'autres tags sont demandés avec --tags ?',
        options: ['always', 'never', 'tagged'], answer: 0,
        explain: 'Slide 117 : les tâches taguées <code>always</code> sont exécutées même quand d\'autres tags sont demandés, sauf avec <code>--skip-tags always</code>.', ref: [117] }
    ] }
  ],
  takeaways: [
    { html: '<code>loop</code> est le mot-clé principal des boucles ; <code>with_items</code> est une ancienne syntaxe encore prise en charge mais moins recommandée.', ref: [100] },
    { html: 'Dans une boucle, l\'élément courant est lu avec <code>item</code>.', ref: [101] },
    { html: '<code>until</code> répète une tâche jusqu\'à ce qu\'une condition soit remplie, avec <code>retries</code> et <code>delay</code>.', ref: [100, 106] },
    { html: 'Les tags étiquettent des tâches pour les exécuter ou les ignorer de manière sélective.', ref: [114] },
    { html: '<code>--tags</code> n\'exécute que les tâches portant le tag ; <code>--skip-tags</code> les ignore, et il l\'emporte si une tâche a les deux.', ref: [116] },
    { html: 'Le tag spécial <code>always</code> s\'exécute même quand d\'autres tags sont demandés ; <code>never</code> ne s\'exécute que s\'il est demandé explicitement.', ref: [117] }
  ]
});
