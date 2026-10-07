/* Module 09 — Templates & async (slides PPTX 120 à 134). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm09', num: 9, emoji: '🧾',
  title: 'Templates & async',
  tagline: 'Générer des fichiers avec les templates Jinja2 et lancer des tâches asynchrones.',
  objectives: [
    { html: 'Définir Jinja : un moteur de templates pour Python utilisé par Ansible.', ref: [121] },
    { html: 'Utiliser les variables <code>{{ ... }}</code>, les structures de contrôle <code>{% ... %}</code> et les filtres dans un template.', ref: [121, 122] },
    { html: 'Écrire une boucle <code>for</code> et une condition <code>if</code> dans un template.', ref: [123, 124] },
    { html: 'Générer un fichier de configuration à partir d\'un template avec le module <code>template</code>.', ref: [126] },
    { html: 'Lancer une tâche en arrière-plan avec <code>async</code> et <code>poll</code>, puis suivre son état avec <code>async_status</code>.', ref: [131, 132] }
  ],
  slides: [
    { title: 'Templates', src: [120],
      blocks: [
        { t: 'code', lang: 'text', code: `https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_templating.html
https://jinja.palletsprojects.com/en/latest/templates/` }
      ] },
    { title: 'What is Jinja?', src: [121],
      blocks: [
        { t: 'bullets', items: ['Jinja is a powerful templating engine for Python, widely used in web development and automation tools like Ansible.', 'Purpose of Jinja Templates:<ul><li>Jinja templates allow you to create dynamic content by embedding variables and expressions within text files.</li></ul>', 'Key Features:<ul><li>Variables: Embed dynamic data using{{ ... }}</li><li>Control Structures: Use {% ... %} for loops, conditionals, and more.</li><li>Filters: Modify variables with built-in filters like {{ variable | filter }}</li><li>Comments: Add comments with {# ... #}that won’t appear in the output.</li></ul>', 'Why Use Jinja with Ansible?<ul><li>Dynamic Configuration: Generate configuration files dynamically based on variables and conditions.</li><li>Reusability: Create reusable templates for different environments and scenarios.</li><li>Flexibility: Easily integrate with Ansible playbooks to automate complex tasks.</li></ul>'] }
      ] },
    { title: 'Templates', src: [122],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Variable:
 {{ variable }}

{{ hostvars[server].ansible_default_ipv4.address }}

Action:
 {% action %}
 {% endaction %}` }
      ] },
    { title: 'Templates', src: [123],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Loop:

{% for server in groups.webservers %}

Server{{ loop.index }} {{ server }}

{% endfor %}` }
      ] },
    { title: 'Templates', src: [124],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Conditions:

{% if ansible_processor_core >=2 %}
- smp: enable
{% else %}
- smp: disable
{% endif %}

{% if my_variable is defined %}` }
      ] },
    { title: 'Templates', src: [125],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Filtres:

{% set my_var='mon-premier-test' %}
{{ my_var|replace('-',' ') }}


{% set servers='server1,server2,server3' %}
{% for server in servers.split(',') %}
{{ server }}
{% endfor %}` }
      ] },
    { title: 'Templates', src: [126],
      blocks: [
        { t: 'code', lang: 'yaml', code: `EXAMPLE
Template/environment.j2
http_proxy="{{ proxy_url }}"
https_proxy="{{ proxy_url }}"

Tasks:
  template:
    src: Template/environment.j2
    dest: /etc/environment` }
      ] },
    { title: 'Exercice: Templates', src: [127, 128],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['Build the /etc/hosts from a template based on inventory'] },
        { t: 'text', html: 'Local hosts must be defined:' },
        { t: 'code', lang: 'text', code: `127.0.0.1   localhost localhost.localdomain
::1         localhost localhost.localdomain` },
        { t: 'reveal', label: 'Voir la solution (slide 128)', html: '<pre># /etc/hosts template\n127.0.0.1   localhost localhost.localdomain\n::1         localhost localhost.localdomain\n{% for host in groups[\'all\'] %}\n{{ hostvars[host][\'ansible_default_ipv4\'][\'address\'] }} {{ host }} {{ hostvars[host][\'ansible_hostname\'] }}\n{% endfor %}\n---\n- hosts: all\n  become: yes\n  tasks:\n    - name: Generate /etc/hosts file from template\n      template:\n        src: hosts.j2\n        dest: /etc/hosts\n      when: hostvars[inventory_hostname][\'ansible_default_ipv4\'] is defined\n---\n- name: Update /etc/hosts\n  hosts: all\n  become: yes\n  tasks:\n    - name: Update /etc/hosts with all servers and add/change GOOGLE.COM\n      lineinfile:\n        path: /etc/hosts\n        line: "{{ hostvars[item][\'ansible_default_ipv4\'][\'address\'] }} {{ item }}"\n      loop: "{{ groups[\'all\'] }}"</pre>' }
      ] },
    { title: '???', src: [129],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Asynchroneous:
https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_async.html` }
      ] },
    { title: 'What Does Asynchronous Mean?', src: [130],
      blocks: [
        { t: 'bullets', items: ['Asynchronous operations do not occur at the same time. They allow tasks to run independently of the main program flow.', 'Importance in Programming:<ul><li>Asynchronous programming is crucial for improving the efficiency and responsiveness of applications, especially in I/O-bound and high-latency operations.</li></ul>', 'Key Concepts:<ul><li>Concurrency: Multiple tasks make progress without waiting for each other.</li><li>Non-blocking: Operations that do not block the execution of other tasks.</li><li>Callbacks, Promises, and Async/Await: Mechanisms to handle asynchronous code in various programming languages.</li></ul>', 'Why Use Asynchronous Programming?<ul><li>Performance: Enhances the performance of applications by allowing multiple operations to run concurrently.</li><li>User Experience: Improves the responsiveness of applications, providing a smoother user experience.</li><li>Scalability: Helps in building scalable applications that can handle numerous simultaneous operations efficiently.</li></ul>'] }
      ] },
    { title: 'Async: 45 seconds', src: [131],
      blocks: [
        { t: 'code', lang: 'text', code: `Run tasks in background until timeout:` },
        { t: 'code', lang: 'text', code: `Asynchroneous` },
        { t: 'code', lang: 'yaml', code: `tasks:
  - name: simulate long running op (15 sec), wait for up to 45 sec, poll every 5 sec
    command: /bin/sleep 15
    async: 45
    poll: 5` },
        { t: 'text', html: 'poll: 5 seconds' }
      ] },
    { title: '???', src: [132],
      blocks: [
        { t: 'code', lang: 'text', code: `Run tasks in background:` },
        { t: 'code', lang: 'text', code: `Asynchrone` },
        { t: 'code', lang: 'yaml', code: `- name: 'DNF - async task'
  ansible.builtin.dnf:
    name: podman
    state: present
  async: 1000
  poll: 0
  register: dnf_sleeper` },
        { t: 'code', lang: 'yaml', code: `- name: 'DNF - check on async task'
  ansible.builtin.async_status:
    jid: "{{ dnf_sleeper.ansible_job_id }}"
  register: job_result
  until: job_result.finished
  retries: 30
  delay: 10` },
        { t: 'code', lang: 'text', code: `Check and wait for task end:` }
      ] },
    { title: 'Exercice: asynchronous', src: [133, 134],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['Upgrade packages', 'Print “Upgrade ongoing”', '- Wait for upgrade done', '- Reboot', '- Wait for server UP', '- Print « All done »'] },
        { t: 'reveal', label: 'Voir la solution (slide 134)', html: '<pre>---\n- hosts: all\n  become: true\n  tasks:\n    - name: Upgrade packages\n      ansible.builtin.dnf:\n        name: "*"\n        state: latest\n      register: upgrade_result\n      async: 3600\n      poll: 0\n    - name: Print completion message\n      ansible.builtin.debug:\n        msg: "Upgrade ongoing "\n    - name: Wait for upgrade to complete\n      ansible.builtin.async_status:\n        jid: "{{ upgrade_result.ansible_job_id }}"\n      register: job_result\n      until: job_result.finished\n      retries: 30\n      delay: 60\n    - name: Reboot the server\n      ansible.builtin.reboot:\n        msg: "Reboot initiated by Ansible"\n        pre_reboot_delay: 10\n        post_reboot_delay: 30\n        reboot_timeout: 600\n    - name: Wait for server to come back up\n      ansible.builtin.wait_for_connection:\n        timeout: 300\n    - name: Print completion message\n      ansible.builtin.debug:\n        msg: "All done"</pre>' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle syntaxe Jinja permet d\'insérer une variable dans un template ?',
        options: ['{{ ... }}', '{% ... %}', '{# ... #}'], answer: 0,
        explain: 'Slide 121 : « Variables » avec <code>{{ ... }}</code>, « Control Structures » avec <code>{% ... %}</code> et « Comments » avec <code>{# ... #}</code>.', ref: [121] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Dans l\'exemple de la slide 131, que signifient <code>async: 45</code> et <code>poll: 5</code> ?',
        options: ['La tâche peut durer jusqu\'à 45 secondes et son état est vérifié toutes les 5 secondes', 'La tâche attend 45 secondes puis s\'exécute 5 fois', 'La tâche est limitée à 5 secondes avec 45 tentatives'], answer: 0,
        explain: 'Le commentaire de la slide 131 précise : « wait for up to 45 sec, poll every 5 sec ».', ref: [131] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle valeur de <code>poll</code> lance une tâche sans attendre sa fin ?',
        options: ['0', '5', '45'], answer: 0,
        explain: 'Slide 132 : <code>async: 1000</code> avec <code>poll: 0</code>, puis une tâche <code>async_status</code> pour vérifier l\'état.', ref: [132] }
    ] }
  ],
  takeaways: [
    { html: 'Jinja permet de créer du contenu dynamique en insérant des variables et des expressions dans des fichiers texte.', ref: [121] },
    { html: 'Les variables s\'écrivent avec <code>{{ ... }}</code>, les structures de contrôle avec <code>{% ... %}</code> et les commentaires avec <code>{# ... #}</code>.', ref: [121] },
    { html: 'Le module <code>template</code> génère un fichier à partir d\'une source (<code>src</code>) vers une destination (<code>dest</code>).', ref: [126] },
    { html: 'Une tâche asynchrone s\'exécute indépendamment du flux principal : <code>async</code> fixe la durée maximale et <code>poll</code> l\'intervalle de vérification.', ref: [130, 131] },
    { html: 'Avec <code>poll: 0</code>, la tâche est lancée sans attendre sa fin ; <code>async_status</code> permet de vérifier son état ensuite.', ref: [132] },
    { html: 'L\'asynchronisme améliore les performances en permettant à plusieurs opérations de s\'exécuter en même temps.', ref: [130] }
  ]
});
