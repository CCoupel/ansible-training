/* Module 07 — Filters & conditions (slides PPTX 82 à 98). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm07', num: 7, emoji: '🧪',
  title: 'Filters & conditions',
  tagline: 'Transformer les données avec les filtres Jinja2 et conditionner l\'exécution des tâches.',
  tagline_en: 'Transform data with Jinja2 filters and make task execution conditional.',
  objectives: [
    { html: 'Définir un filtre : une fonction Jinja2 qui transforme et manipule des données dans les playbooks et les templates.', html_en: 'Define a filter: a Jinja2 function that transforms and manipulates data in playbooks and templates.', ref: [83] },
    { html: 'Utiliser des filtres de formatage, de valeur par défaut et d\'obligation (<code>to_json</code>, <code>default</code>, <code>mandatory</code>).', html_en: 'Use formatting, default-value and mandatory filters (<code>to_json</code>, <code>default</code>, <code>mandatory</code>).', ref: [83, 84, 85] },
    { html: 'Conditionner l\'exécution d\'une tâche avec <code>when</code> et <code>register</code>.', html_en: 'Make a task conditional with <code>when</code> and <code>register</code>.', ref: [92, 93] },
    { html: 'Utiliser <code>failed_when</code> et <code>changed_when</code> pour définir l\'échec ou le changement d\'une tâche.', html_en: 'Use <code>failed_when</code> and <code>changed_when</code> to define the failure or the change of a task.', ref: [92] },
    { html: 'Déclencher un redémarrage avec un handler appelé par <code>notify</code>.', html_en: 'Trigger a restart with a handler called by <code>notify</code>.', ref: [95] }
  ],
  slides: [
    { title: 'Filtres', src: [82],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_filters.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_filters.html</a>' }
      ] },
    { title: 'Filters: concepts', src: [83],
      blocks: [
        { t: 'bullets', items: ['Definition: Filters in Ansible are used to transform and manipulate data within your playbooks and templates.', 'Purpose: They enhance the flexibility and power of your automation scripts by allowing you to format, modify, and manage data dynamically.', 'Key Concepts:<ul><li>Jinja2 Filters: Ansible uses Jinja2 templating, which includes a wide range of built-in filters.</li><li>Custom Filters: You can create your own filters to meet specific needs.</li></ul>', 'Common Filters:<ul><li>Formatting Data: to_json, to_yaml</li><li>Handling Undefined Variables: default, mandatory</li><li>String Manipulation: split, replace</li><li>Math Operations: abs, round</li></ul>', 'Usage Examples:<ul><li>Default Values: {{ some_variable | default(\'default_value\') }}</li><li>String Operations: {{ \'hello world\' | upper }}</li></ul>', 'Benefits: Filters simplify data handling, improve readability, and reduce the complexity of your playbooks.'] }
      ] },
    { title: 'Filtres: modification and format', src: [84],
      blocks: [
        { t: 'code', lang: 'jinja', code: `Modification and Format:

to(_nice)_json / to(_nice)_yaml
from_json / from_yaml

{{ ma_variable|to_json }}
{{ an_other|from_yaml }}` }
      ] },
    { title: 'Filtres: mandatory and default', src: [85],
      blocks: [
        { t: 'code', lang: 'jinja', code: `Mandatory
{{ ma_variable|mandatory("var requited") }}

default(default_var)
{{ my_other|default(1234) }}` }
      ] },
    { title: 'Filtres: flatten, min, max', src: [86],
      blocks: [
        { t: 'code', lang: 'jinja', code: `flatten
{{ [1,[2,3]]|flatten }}

Min, max,
{{ other_variable|min }}` }
      ] },
    { title: 'Filtres: documentation', src: [87],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_filters.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_filters.html</a>' },
        { t: 'img', file: 'assets/img/s087-1.png', alt: 'Capture de la page de documentation « Filters » : liste des sujets (filtres de formatage, valeurs par défaut, listes, dictionnaires, réseau…)', alt_en: 'Screenshot of the “Filters” documentation page: list of topics (formatting filters, default values, lists, dictionaries, network…)' }
      ] },
    { title: 'Exercice: Filtres', src: [88, 89],
      blocks: [
        { t: 'lab', steps: ['- Write a playbook to add a user with variables:', '- a mandatory name', '- a group as “nobody” if not provided'] },
        { t: 'code', lang: 'console', code: `ansible-playbook -i inventory set_user.yml -e user_name="toto" [-e user_group="titi"]
ansible-playbook -i inventory set_user.yml -e "user_name='toto' user_group='titi'"` },
        { t: 'reveal', slide: 89, html: '<pre>---\n- hosts: all\n  become: true\n  vars:\n    The_Name: "{{ user_name | mandatory(\'user_name must be defined\') }}"\n    The_Group: "{{ user_group | default(\'nobody\') }}"\n  tasks:\n    - name: set Group\n      ansible.builtin.group:\n        name: "{{ The_Group }}"\n        state: present\n    - name: Add user with specified or default group\n      ansible.builtin.user:\n        name: "{{ The_Name }}"\n        group: "{{ The_Group }}"\n        state: present</pre>' }
      ] },
    { title: 'Lookup plugins', src: [90],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/lookup.html#plugin-list" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/lookup.html#plugin-list</a>' },
        { t: 'img', file: 'assets/img/s090-1.png', alt: 'Capture de la page de documentation « Plugin list » des plugins lookup', alt_en: 'Screenshot of the “Plugin list” documentation page for lookup plugins' }
      ] },
    { title: 'CONDITIONS', src: [91],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_conditionals.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_conditionals.html</a>' }
      ] },
    { title: 'Conditions: concepts', src: [92],
      blocks: [
        { t: 'bullets', items: ['Definition: Conditions in Ansible allow you to control the execution of tasks based on specific criteria.', 'Purpose: They enable more dynamic and flexible playbooks by executing tasks only when certain conditions are met.', 'Key Concepts:<ul><li>when: A keyword used to specify conditions for task execution.</li><li>register: Used to store the result of a task, which can then be used in conditions.</li><li>failed_when and changed_when: Custom conditions to define task failure or change status.</li></ul>', 'Usage Examples:<ul><li>Simple Condition: when: ansible_os_family == \'Debian\'</li></ul>'] }
      ] },
    { title: 'CONDITIONS EXAMPLE', src: [93],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: install and start apache
  hosts: WEB
  vars:
    http_port: 80
    max_clients: 200
  remote_user: root

  tasks:
  - name: install httpd
    ansible.builtin.dnf:
      name: httpd
      state: latest
  - name: write the apache config file
    ansible.builtin.template:
      src: /srv/httpd.j2
      dest: /etc/httpd.conf
    register: APACHE
  - name: start httpd
    ansible.builtin.service:
      name: httpd
      state: restarted
    when: APACHE.changed == true` }
      ] },
    { title: 'Run a task depending on the result of a previous task:', src: [94],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: update all pkgs
  tags:
  - prepare
  ansible.builtin.dnf:
    name: "*"
    state: latest

- name: check if REBOOT needed
  ansible.builtin.shell: test $(rpm -q --last kernel | sed  's/^kernel-\\(.*\\)  .*/\\1/'|head -1) == $(uname -r)
  register: reboot_needed
  ignore_errors: true

- name: restart machine
  ansible.builtin.shell: sleep 2 && shutdown -r now "Ansible updates triggered"
  async: 1
  poll: 0
  become: true
  ignore_errors: true
  when: reboot_needed is failed` }
      ] },
    { title: 'CONDITIONS EXAMPLE: handlers', src: [95],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: update all pkgs
  ansible.builtin.dnf:
    name: "*"
    state: latest

- name: check if REBOOT needed
  ansible.builtin.shell: test $(rpm -q --last kernel | sed  's/^kernel-\\(.*\\)  .*/\\1/'|head -1) == $(uname -r)
  notify: restart machine
  ignore_errors: true
- name: update grub and kernel default values
  ansible.builtin.shell: update_boot_parameters
  notify: restart machine
  ignore_errors: true

Handlers:
- name: restart machine
  ansible.builtin.reboot:
- name: restarted server
  listen: restart machine
  ansible.builtin.debug:
    msg: " {{ inventory_hostname }} REBOOTED"` }
      ] },
    { title: 'CONDITIONS EXAMPLE: documentation', src: [96],
      blocks: [
        { t: 'code', lang: 'text', code: `    Conditionals
        * The When Statement
        * Loops and Conditionals
        * Loading Custom Facts
        * Applying ‘when’ to roles and includes
        * Conditional Imports
        * Selecting Files And Templates Based On Variables
        * Register Variables` }
      ] },
    { title: 'CONDITIONS Exercice', src: [97, 98],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['- Write a playbook:', '- check internet access', '- set proxy variables if needed', '- reboot with handler if proxy updated'] },
        { t: 'text', html: 'Update /etc/environment:' },
        { t: 'code', lang: 'ini', code: `http_proxy= http://proxy.example.com:8080
 https_proxy= http://proxy.example.com:8080` },
        { t: 'reveal', slide: 98, html: '<pre>- name: Check internet access and set proxy if needed\n  hosts: all\n  tasks:\n    - name: Check internet access without proxy\n      uri:\n        url: http://gitlab.com\n        return_content: no\n      register: internet_check\n      ignore_errors: yes\n    - name: Set proxy variables if internet access fails\n      lineinfile:\n        dest: /etc/environment\n        regexp: "^{{ item.var }}="\n        line: "{{ item.var }}={{ item.value }}"\n        state: present\n      loop:\n        - { var: \'http_proxy\', value: \'http://proxy.example.com:8080\' }\n        - { var: \'https_proxy\', value: \'http://proxy.example.com:8080\' }\n      when: internet_check.failed\n      notify: Reboot_Required\n  handlers:\n    - name: Reboot the machine\n      Listen: Reboot_Required\n      reboot:\n        msg: "Reboot required after proxy update"</pre>' }
      ] },
    { title: 'Quiz 1', title_en: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quel filtre fournit une valeur lorsqu\'une variable n\'est pas définie ?', q_en: 'Which filter provides a value when a variable is not defined?',
        options: ['flatten', 'default', 'mandatory'],
        options_en: ['The flatten filter', 'The default filter', 'The mandatory filter'], answer: 1,
        explain: 'Slide 83 : « Handling Undefined Variables: default, mandatory » ; la slide 85 montre <code>default(default_var)</code>, alors que <code>mandatory</code> impose la définition de la variable.',
        explain_en: 'Slide 83: “Handling Undefined Variables: default, mandatory”; slide 85 shows <code>default(default_var)</code>, whereas <code>mandatory</code> requires the variable to be defined.', ref: [83, 85] }
    ] },
    { title: 'Quiz 2', title_en: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Dans la solution de l\'exercice sur les filtres, quel filtre rend la variable <code>user_name</code> obligatoire ?', q_en: 'In the solution of the filters exercise, which filter makes the <code>user_name</code> variable required?',
        options: ['mandatory', 'default', 'upper'],
        options_en: ['The mandatory filter', 'The default filter', 'The upper filter'], answer: 0,
        explain: 'La slide 89 utilise <code>{{ user_name | mandatory(\'user_name must be defined\') }}</code>.',
        explain_en: 'Slide 89 uses <code>{{ user_name | mandatory(\'user_name must be defined\') }}</code>.', ref: [89] }
    ] },
    { title: 'Quiz 3', title_en: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quel mot-clé conditionne l\'exécution d\'une tâche ?', q_en: 'Which keyword makes the execution of a task conditional?',
        options: ['register', 'notify', 'when'],
        options_en: ['The register keyword', 'The notify keyword', 'The when keyword'], answer: 2,
        explain: 'Slide 92 : « when: A keyword used to specify conditions for task execution » ; <code>register</code> stocke le résultat d\'une tâche pour l\'utiliser dans une condition.',
        explain_en: 'Slide 92: “when: A keyword used to specify conditions for task execution”; <code>register</code> stores the result of a task so it can be used in a condition.', ref: [92] }
    ] }
  ],
  takeaways: [
    { html: 'Les filtres Jinja2 transforment et manipulent les données dans les playbooks et les templates.', html_en: 'Jinja2 filters transform and manipulate data in playbooks and templates.', ref: [83] },
    { html: '<code>default</code> fournit une valeur par défaut ; <code>mandatory</code> impose qu\'une variable soit définie.', html_en: '<code>default</code> provides a default value; <code>mandatory</code> requires a variable to be defined.', ref: [83, 85] },
    { html: '<code>to_json</code> et <code>to_yaml</code> servent au formatage des données ; <code>split</code> et <code>replace</code> à la manipulation de chaînes.', html_en: '<code>to_json</code> and <code>to_yaml</code> format data; <code>split</code> and <code>replace</code> manipulate strings.', ref: [83] },
    { html: '<code>when</code> conditionne l\'exécution d\'une tâche ; <code>register</code> stocke le résultat d\'une tâche pour l\'utiliser dans une condition.', html_en: '<code>when</code> makes a task conditional; <code>register</code> stores the result of a task so it can be used in a condition.', ref: [92] },
    { html: 'Une tâche peut dépendre du résultat d\'une tâche précédente, par exemple avec <code>when: reboot_needed is failed</code>.', html_en: 'A task can depend on the result of a previous task, for example with <code>when: reboot_needed is failed</code>.', ref: [94] },
    { html: 'Un handler appelé par <code>notify</code> peut redémarrer la machine ; <code>listen</code> regroupe des handlers sous un même nom.', html_en: 'A handler called by <code>notify</code> can restart the machine; <code>listen</code> groups handlers under a single name.', ref: [95] }
  ]
});
