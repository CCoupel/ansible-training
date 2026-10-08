/* Module 11 — Roles, collections & Galaxy (slides PPTX 142 à 161). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm11', num: 11, emoji: '📦',
  title: 'Roles, collections & Galaxy',
  tagline: 'Réutiliser le contenu Ansible avec les rôles, les collections et Ansible Galaxy.',
  objectives: [
    { html: 'Définir un rôle : un moyen d\'organiser tâches, variables, fichiers, templates et modules en unités réutilisables.', ref: [142] },
    { html: 'Appeler des rôles dans un play avec <code>roles</code> et distinguer <code>include_role</code> (dynamique) de <code>import_role</code> (statique).', ref: [145] },
    { html: 'Décrire l\'arborescence d\'un rôle (<code>tasks</code>, <code>handlers</code>, <code>templates</code>, <code>files</code>, <code>vars</code>, <code>defaults</code>, <code>meta</code>).', ref: [146] },
    { html: 'Définir une collection et la situer par rapport aux rôles.', ref: [143, 148] },
    { html: 'Installer des rôles depuis Galaxy avec <code>ansible-galaxy</code> et les déclarer dans <code>roles/requirements.yml</code>.', ref: [155, 156] }
  ],
  slides: [
    { title: 'Ansible Roles:', src: [142],
      blocks: [
        { t: 'bullets', items: ['a way to organize playbooks and other Ansible content by grouping related tasks, variables, files, templates, and modules into reusable units.', 'Purpose of Roles:<ul><li>Simplify the management of complex playbooks by breaking them down into smaller, reusable components.</li><li>Promote reusability and maintainability of Ansible code.</li></ul>'] }
      ] },
    { title: 'Ansible Collections:', src: [143],
      blocks: [
        { t: 'text', html: 'The standard way to distribute and manage Ansible content.' },
        { t: 'bullets', items: ['Key Features:<ul><li>Content Organization: Organize roles, modules, and plugins into logical groups.</li><li>Versioning: Manage multiple versions of your content and track changes.</li><li>Dependency Management: Easily declare and manage dependencies between collections.</li><li>Certification: Ensure your collections meet Ansible\'s quality and security standards.</li></ul>', 'Why Use Collections?<ul><li>Modularity: Break down complex automation projects into reusable, modular components.</li><li>Reusability: Share and reuse content across multiple projects and teams.</li><li>Simplification: Simplify your automation workflow by managing dependencies and versions in one place.</li></ul>'] }
      ] },
    { title: 'Ansible Galaxy:', src: [144],
      blocks: [
        { t: 'bullets', items: ['public repository for sharing Ansible roles and collections.', 'Key Features:<ul><li>Role Discovery: Search and download roles from the Galaxy website or using the ansible-galaxy command.</li><li>Community Contributions: Access a wide range of roles contributed by the Ansible community.</li><li>Role Management: Easily manage roles and collections within your Ansible projects.</li></ul>', 'Why Use Roles and Galaxy?<ul><li>Efficiency: Save time by reusing existing roles instead of writing everything from scratch.</li><li>Collaboration: Leverage the collective knowledge and contributions of the Ansible community.</li><li>Scalability: Organize and scale your automation projects more effectively by using roles and collections.</li></ul>'] }
      ] },
    { title: 'Re-usable: Role', src: [145],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- name: my installer
  hosts: all
  roles:
    - role: configure_ssh
    - role: secure_os
    - role: install_apache
    - role: secure_apache` },
        { t: 'text', html: 'Roles are ways of automatically loading vars_files, tasks, and handlers' },
        { t: 'text', html: '<b>based on a known file structure.</b>' },
        { t: 'text', html: 'Grouping content by roles also allows easy sharing of roles with other users.' },
        { t: 'code', lang: 'yaml', code: `- name: my installer
  hosts: all
  tasks:
    - include_role: {name: configure_ssh}      <= Dynamic Role
    - import_role: {name: secure_os}           <= Static Role` }
      ] },
    { title: 'Re-uasable: Role', src: [146],
      blocks: [
        { t: 'code', lang: 'text', code: `roles/
    common/               # this hierarchy represents a "role"
        tasks/            #
            main.yml      #  <-- tasks file can include smaller files if warranted
        handlers/         #
            main.yml      #  <-- handlers file
        templates/        #  <-- files for use with the template resource
            ntp.conf.j2   #  <------- templates end in .j2
        files/            #
            bar.txt       #  <-- files for use with the copy resource
            foo.sh        #  <-- script files for use with the script resource
        vars/             #
            main.yml      #  <-- variables associated with this role
        defaults/         #
            main.yml      #  <-- default lower priority variables for this role
        meta/             #
            main.yml      #  <-- role dependencies
        library/          # roles can also include custom modules
        module_utils/     # roles can also include custom module_utils
        lookup_plugins/   # or other types of plugins, like lookup in this case
    webtier/              # same kind of structure as "common" was above, done for the webtier role
    monitoring/           # ""
    fooapp/               # ""` }
      ] },
    { title: 'Re-usable: Role Documentation', src: [147],
      blocks: [
        { t: 'code', lang: 'console', code: `meta/argument_specs.yml
---
argument_specs:
  # roles/myapp/tasks/main.yml entry point
  main:
    short_description: Main entry point for the myapp role
    description:
      - human readable description.
    author:
      - Cyril Coupel
    options:
      myapp_int:
        type: "int"
        required: false
        default: 42
        description:
          - "The integer value, defaulting to 42."
          - "This is a second paragraph."` },
        { t: 'text', html: 'Roles are shared =&gt; needs and must be documented' }
      ] },
    { title: 'Re-usable: Collection', src: [148],
      blocks: [
        { t: 'code', lang: 'text', code: `mynamespace/
└── mycollection/
  ├── docs/
  ├── galaxy.yml
  ├── plugins/
  │   ├── modules/
  │   │   └── module1.py
  │   ├── inventory/
  │   └── .../
  ├── README.md
  ├── roles/
  │   ├── role1/
  │   ├── role2/
  │   └── .../
  ├── playbooks/
  │   ├── files/
  │   ├── vars/
  │   ├── templates/
  │   └── tasks/
  └── tests/` },
        { t: 'text', html: 'mynamespace.mycollection.role1' }
      ] },
    { title: 'Re-usable: Collection (steps)', src: [149],
      blocks: [
        { t: 'bullets', items: ['Step 1: Create a new collection<ul><li>Create a new directory for your collection and navigate into it: `mkdir my_collection &amp;&amp; cd my_collection`</li><li>Initialize the collection using `ansible-galaxy collection init my_namespace.my_collection`</li></ul>', 'Step 2: Create a new role within the collection<ul><li>Create a new directory for your role within the collection: `mkdir roles/my_role`</li><li>Navigate into the role directory: `cd roles/my_role`</li><li>Initialize the role using `ansible-galaxy role init my_role`</li></ul>', 'Step 3: Develop your role<ul><li>Write your role\'s code in the `tasks`, `handlers`, `templates`, and `defaults` directories</li><li>Test your role locally using `ansible-playbook -i &lt;hosts_file&gt; &lt;playbook_file&gt;`</li></ul>', 'Step 4: Configure your collection<ul><li>In the collection\'s root directory, edit the `galaxy.yml` file to include information about your collection and role</li><li>Add the following lines to the `galaxy.yml` file:</li></ul>'] },
        { t: 'bullets', items: ['Step 5: Build your collection<ul><li>Run `ansible-galaxy collection build` to build your collection</li><li>This will create a `my_namespace-my_collection-&lt;version&gt;.tar.gz` file in the collection\'s root directory</li></ul>', 'Step 6: Publish your collection to Ansible Galaxy<ul><li>Run `ansible-galaxy collection publish` to upload your collection to Ansible Galaxy</li><li>Run `ansible-galaxy collection publish --server &lt;your_automation_hub_url&gt; --token &lt;your_api_token&gt; my_namespace-my_collection-&lt;version&gt;.tar.gz`</li></ul>'] },
        { t: 'code', lang: 'yaml', code: `roles:
  - my_role` }
      ] },
    { title: '# ansible-doc -t role my-role', src: [150],
      blocks: [
        { t: 'text', html: '<b>Description:</b>' },
        { t: 'bullets', items: ['ansible-doc displays information about installed modules and roles in Ansible.', 'Provides a concise list of plugins with short descriptions and documentation snippets.'] },
        { t: 'text', html: '<b>Basic Usage:</b>' },
        { t: 'text', html: 'ansible-doc &lt;module_or_role_name&gt;' },
        { t: 'text', html: '<b>Common Options:</b>' },
        { t: 'bullets', items: ['-h, --help : Show help message and exit.', '--version : Show version number, config file location, module search path, and exit.', '-t &lt;TYPE&gt;, --type &lt;TYPE&gt; : Choose plugin ype (default is “module”). Available types: become, cache, callback, cliconf, connection, httpapi, inventory, lookup, netconf, shell, vars, module, strategy, test, filter, role, keyword.', '-l, --list : List available plugins. An argument can be used for filtering.', '-s, --snippet : Show playbook snippet for these plugin types: inventory, lookup, module.'] },
        { t: 'text', html: '<b>Ansible-doc Overview</b>' }
      ] },
    { title: 'Exercice: role', src: [151, 152],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['Create a Rôle to reboot and wait for the server to be UP and then re Gather facts'] },
        { t: 'reveal', slide: 152, html: '<pre># File: roles/reboot-server/tasks/main.yml\n---\n- name: Reboot server and wait for it to come back up\n  tasks:\n    - name: Reboot server\n      reboot:\n        msg: "Rebooting server"\n    - name: Wait for server to come back up\n      wait_for:\n        host: "{{ ansible_host }}"\n        port: 22\n        delay: 30\n        timeout: 300\n  - name: Regather Facts\n    setup:\n---\n- name: Check internet access and set proxy if needed\n  hosts: all\n  roles:\n    - reboot-server</pre>' }
      ] },
    { title: 'Re-usable: GALAXY (overview)', src: [153],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 560 260" role="img" aria-labelledby="m11-svg1-t" aria-describedby="m11-svg1-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m11-svg1-t">Rôles partagés via Galaxy</title><desc id="m11-svg1-d">Deux rôles (Role), chacun regroupant cinq ensembles de tâches (Tasks), sont publiés sur Galaxy.</desc><defs><marker id="ar-m11-svg1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="10" y="10" width="150" height="230" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="85" y="30" text-anchor="middle" font-weight="700">Role</text><rect x="25" y="40" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="57" text-anchor="middle" font-weight="700">Tasks</text><rect x="25" y="76" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="93" text-anchor="middle" font-weight="700">Tasks</text><rect x="25" y="112" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="129" text-anchor="middle" font-weight="700">Tasks</text><rect x="25" y="148" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="165" text-anchor="middle" font-weight="700">Tasks</text><rect x="25" y="184" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="201" text-anchor="middle" font-weight="700">Tasks</text><rect x="200" y="10" width="150" height="230" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="275" y="30" text-anchor="middle" font-weight="700">Role</text><rect x="215" y="40" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="275.0" y="57" text-anchor="middle" font-weight="700">Tasks</text><rect x="215" y="76" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="275.0" y="93" text-anchor="middle" font-weight="700">Tasks</text><rect x="215" y="112" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="275.0" y="129" text-anchor="middle" font-weight="700">Tasks</text><rect x="215" y="148" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="275.0" y="165" text-anchor="middle" font-weight="700">Tasks</text><rect x="215" y="184" width="120" height="28" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="275.0" y="201" text-anchor="middle" font-weight="700">Tasks</text><rect x="420" y="90" width="120" height="60" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="480.0" y="107" text-anchor="middle" font-weight="700">Galaxy</text><line x1="160" y1="125" x2="418" y2="120" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m11-svg1)"/><line x1="350" y1="125" x2="418" y2="125" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m11-svg1)"/></svg>' },
        { t: 'text', html: '<a href="https://galaxy.ansible.com/search?order_by=-relevance&amp;page_size=10" target="_blank" rel="noopener">https://galaxy.ansible.com/search?order_by=-relevance&amp;page_size=10</a>' }
      ] },
    { title: 'Re-usable: GALAXY (ansible-galaxy --help)', src: [154],
      blocks: [
        { t: 'code', lang: 'yaml', code: `ansible-galaxy --help
usage: ansible-galaxy [-h] [--version] [-v] TYPE ...

Perform various Role and Collection related operations.

positional arguments:
  TYPE
    collection   Manage an Ansible Galaxy collection.
    role         Manage an Ansible Galaxy role.

options:
  --version      show program's version number, config file location,
                 configured module search path, module location, executable
                 location and exit
  -h, --help     show this help message and exit
  -v, --verbose  Causes Ansible to print more debug messages. Adding multiple
                 -v will increase the verbosity, the builtin plugins currently
                 evaluate up to -vvvvvv. A reasonable level to start is -vvv,
                 connection debugging might require -vvvv. This argument may
                 be specified multiple times.` }
      ] },
    { title: 'Re-usable: GALAXY (commands)', src: [155],
      blocks: [
        { t: 'code', lang: 'console', code: `# ansible-galaxy search haproxy
# ansible-galaxy install haproxy
# ansible-galaxy remove  haproxy

# ansible-galaxy import mon_role` }
      ] },
    { title: 'Re-usable: GALAXY (requirements.yml)', src: [156],
      blocks: [
        { t: 'text', html: 'Declare the use of external roles from roles/requirements.yml file' },
        { t: 'code', lang: 'console', code: `---
roles:
  - name: geerlingguy.nginx
    version: 3.3.1
  - src: git@git.example.com:my_namespace/ansible-nginx-acme.git
    scm: git
    version: main
    name: nginx-acme-ssh

collections:
  - name: ansible.posix
    version: 2.2.2
  - name: my_namespace.my_collection
    src: git@git.example.com:my_namespace/ansible-my-collection.git
    scm: git
    version: "1.2.3"
# versions read on galaxy.ansible.com on 2026-10-06` }
      ] },
    { title: 'Re-usable: GALAXY (exercise)', src: [157, 158],
      blocks: [
        { t: 'lab', title: 'Exercise :', steps: ['Install the NGINX rôle from the galaxy', 'Where is it store?'] },
        { t: 'reveal', slide: 158, html: '<pre>ansible-galaxy install nginx\nBy default, Ansible Galaxy roles are installed in the `~/.ansible/roles` directory\nansible-galaxy install --roles-path /path/to/roles nginx\nroles:\n  - nginx</pre>' }
      ] },
    { title: 'Re-usable: GALAXY (collection init)', src: [159],
      blocks: [
        { t: 'text', html: 'ansible-galaxy collection init &lt;namespace&gt;.&lt;collection&gt;' },
        { t: 'bullets', items: ['=&gt; generate &lt;namespace&gt; tree directories'] },
        { t: 'text', html: 'galaxy.yml:' },
        { t: 'code', lang: 'yaml', code: `namespace: "my_namespace"
name: "miq"
version: "0.1.0"
description: "ManageIQ management tool (legacy integration example)"
readme: "README.md"
license:
  - "GPL-2.0-or-later"
authors:
  - "Your Name"
repository: "https://gitlab.example.com/........"` }
      ] },
    { title: 'Re-usable: GALAXY (role init)', src: [160],
      blocks: [
        { t: 'text', html: 'ansible-galaxy role init &lt;role&gt;' },
        { t: 'bullets', items: ['=&gt; generate &lt;role&gt; tree directories'] },
        { t: 'text', html: 'Meta/main.yml' },
        { t: 'code', lang: 'yaml', code: `---
galaxy_info:
  role_name: manageiq_service_action
  version: "0.1.0"
  author: Your Name
  description: "ManageIQ custom action request (legacy integration example)"
  license: "GPL-2.0-or-later"
  min_ansible_version: "2.20"
  platforms:
    - name: EL
      versions:
        - all
    - name: Ubuntu
      versions:
        - all
  galaxy_tags:
    - manageiq
    - automation` }
      ] },
    { title: 'Re-usable: GALAXY (collection build)', src: [161],
      blocks: [
        { t: 'code', lang: 'console', code: `Re-usable: GALAXY
ansible-galaxy collection build --force
		=> generate tar.gz file
ansible-galaxy collection publish \\
    --server https://galaxy-test.example.com/api/galaxy \\
    --ignore-certs \\
    --token xxx \\
    my_namespace-miq-1.0.1.tar.gz` }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quel appel de rôle est dynamique ?',
        options: ['include_role', 'import_role', 'ansible-galaxy role init'], answer: 0,
        explain: 'Slide 145 : <code>include_role</code> est annoté « Dynamic Role » et <code>import_role</code> « Static Role ».', ref: [145] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Où les rôles Ansible Galaxy sont-ils installés par défaut ?',
        options: ['/etc/ansible/roles', '/usr/share/ansible/roles', '~/.ansible/roles'], answer: 2,
        explain: 'Slide 158 : « By default, Ansible Galaxy roles are installed in the <code>~/.ansible/roles</code> directory ».', ref: [158] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle structure est présentée comme « la manière standard de distribuer et de gérer du contenu Ansible » ?',
        options: ['Un inventaire', 'Une collection', 'Un playbook'], answer: 1,
        explain: 'Slide 143 : « Ansible Collections: The standard way to distribute and manage Ansible content ».', ref: [143] }
    ] }
  ],
  takeaways: [
    { html: 'Un rôle regroupe tâches, variables, fichiers, templates et modules en unités réutilisables et simplifie les playbooks complexes.', ref: [142] },
    { html: 'Les rôles chargent automatiquement <code>vars_files</code>, tâches et handlers à partir d\'une structure de fichiers connue.', ref: [145] },
    { html: '<code>include_role</code> est dynamique, <code>import_role</code> est statique.', ref: [145] },
    { html: 'Une collection est la manière standard de distribuer et de gérer du contenu Ansible : rôles, modules et plugins, avec versions et dépendances.', ref: [143] },
    { html: 'Ansible Galaxy est le dépôt public de partage de rôles et de collections ; la commande <code>ansible-galaxy</code> permet de les rechercher et de les installer.', ref: [144] },
    { html: 'Un rôle partagé doit être documenté, par exemple dans <code>meta/argument_specs.yml</code>.', ref: [147] }
  ]
});
