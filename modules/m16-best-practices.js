/* Module 14 — Best practices (slides PPTX 194 à 216). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm16', num: 16, emoji: '✅',
  title: 'Best practices',
  tagline: 'Écrire des playbooks et des rôles lisibles, sûrs et performants.',
  objectives: [
    { html: 'Appliquer des conventions de nommage : préfixer les variables avec le nom du rôle et les variables internes avec « _ ».', ref: [205] },
    { html: 'Contrôler l\'intégrité des variables avec <code>assert</code> et <code>argument_specs</code>.', ref: [206] },
    { html: 'Choisir le bon module et préférer la fonction multivaleur d\'un module aux tâches répétitives ou aux boucles.', ref: [207, 226] },
    { html: 'Structurer un projet : playbook maître avec <code>import_playbook</code>, rôles et répertoires.', ref: [209, 215, 217] },
    { html: 'Optimiser l\'exécution : désactiver les facts inutiles, réutiliser les connexions SSH, choisir la stratégie et le nombre de forks.', ref: [221, 222, 223, 224] }
  ],
  slides: [
    { title: 'Cas concret', src: [204],
      blocks: [
        { t: 'text', html: 'BEST PRACTICES' }
      ] },
    { title: 'Use self explanatory name', src: [205],
      blocks: [
        { t: 'text', html: 'Prefix the name with the role name to avoid collision' },
        { t: 'bullets', items: ['Role1_http_port=80'] },
        { t: 'text', html: 'Prefix the internal used vars with ‘_’' },
        { t: 'bullets', items: ['_Role1_websocket_port="{{ Role1_http_port + 10 }}"'] },
        { t: 'text', html: 'Define default extra vars  values in vars file or default/main.yml for roles' },
        { t: 'bullets', items: ['_ Default_Role1_http_port ="8080"'] },
        { t: 'text', html: 'Define the internal used extra var based on default and provided value' },
        { t: 'bullets', items: ['_ Role1_http_port ="{{ Role1_http_port | default(_ Default_Role1_http_port ) }}"'] },
        { t: 'text', html: 'extra vars' }
      ] },
    { title: 'Control vars integrity at beginning of playbook / Role', src: [206],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- name: _my_param must be less than 100
  ansible.builtin.assert:
    that:
      - _my_param <= 100
      - _my_param >= 0
    fail_msg: "'my_param' = {{ _my_param }} must be between 0 and 100"
    success_msg: "'my_param' = {{ _my_param }} is between 0 and 100"` },
        { t: 'text', html: 'extra vars integrity' },
        { t: 'code', lang: 'console', code: `Define vars integrity definition for roles:

# roles/myapp/meta/argument_specs.yml
---
argument_specs:
  # roles/myapp/tasks/main.yml entry point
  main:
    short_description: The main entry point for the myapp role.
    options:
      myapp_int:
        type: "int"
        required: false
        default: 42
        description: "The integer value, defaulting to 42."

      myapp_str:
        type: "str"
        required: true
        description: "The string value"` }
      ] },
    { title: 'Use the right module ….', src: [207],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- name: Remove package via DNF
  ansible.builtin.dnf:
    name: "{{ yum_package_name_to_remove }}"
    state: absent
  when: ansible_pkg_mgr == 'dnf' and yum_package_name_to_remove is defined

- name: Install package via DNF
  ansible.builtin.dnf:
    name: "{{ yum_package_name_to_install }}"
    state: latest
  when: ansible_pkg_mgr == 'dnf'

- name: Remove package on apt base Linux
  ansible.builtin.apt:
     name: "{{ apt_package_name_to_remove }}"
     state: absent
  when: ansible_pkg_mgr == 'apt' and apt_package_name_to_remove is defined` },
        { t: 'text', html: 'module' },
        { t: 'code', lang: 'yaml', code: `…. for the right action
---
- name: Remove packag
  ansible.builtin.package:
    name: "{{ yum_package_name_to_remove }}"
    state: absent
  when: yum_package_name_to_remove is defined

- name: Install packag
  ansible.builtin.package:
    name: "{{ yum_package_name_to_install }}"
    state: latest
  when: yum_package_name_to_install is defined` }
      ] },
    { title: 'Vault: encrypt variable rather than file', src: [208],
      blocks: [
        { t: 'text', html: 'Playbook Vault' },
        { t: 'code', lang: 'yaml', code: `ansible-vault encrypt_string --vault-id dev@a_password_file 'foobar' --name 'the_secret' >> vars.yml
the_secret: !vault |
      $ANSIBLE_VAULT;1.1;AES256;dev
      62313365396662343061393464336163383764373764613633653634306231386433626436623361
      6134333665353966363534333632666535333761666131620a663537646436643839616531643561
      63396265333966386166373632626539326166353965363262633030333630313338646335303630
      3438626666666137650a353638643435666633633964366338633066623234616432373231333331
      6564
ansible localhost -m ansible.builtin.debug -a var=the_secret -e "@vars.yml" --vault-id dev@a_password_file` },
        { t: 'text', html: 'ansible-vault encrypt --vault-id dev@a_password_file vars.yml' },
        { t: 'text', html: '$ANSIBLE_VAULT;1.1;AES256;dev' },
        { t: 'bullets', items: ['62313365396662343061393464336163383764373764613633653634306231386433626436623361', '6134333665353966363534333632666535333761666131620a663537646436643839616531643561', '63396265333966386166373632626539326166353965363262633030333630313338646335303630', '3438626666666137650a353638643435666633633964366338633066623234616432373231333331', '6564'] },
        { t: 'text', html: 'ansible-vault view --vault-id dev@a_password_file vars.yml' }
      ] },
    { title: 'Split your playbook into more simple plays or roles', src: [209],
      blocks: [
        { t: 'text', html: 'Use master playbook and include subsequent other playbooks and roles' },
        { t: 'bullets', items: ['Isolate each function on its own directory tree', 'Ability to run independently'] },
        { t: 'text', html: '<b>Organize playbooks with:</b>' },
        { t: 'bullets', items: ['First one to prepare and validate', 'Last one to clean up'] },
        { t: 'text', html: 'Playbook Master' },
        { t: 'text', html: '---' },
        { t: 'text', html: '# file: main.yml' },
        { t: 'text', html: '- import_playbook: requirements.yml' },
        { t: 'text', html: '- import_playbook: webservers.yml' },
        { t: 'text', html: '- import_playbook: dbservers.yml' },
        { t: 'text', html: '- import_playbook: cleanup.yml' }
      ] },
    { title: 'Prefer jinja templates instead of file change', src: [210],
      blocks: [
        { t: 'text', html: 'Avoid modifying existing file, prefer pushing a complete built one' },
        { t: 'text', html: 'Playbook Templates' },
        { t: 'text', html: '- name: Copy a version of httpd.conf that is dependent on the OS.' },
        { t: 'bullets', items: ['ansible.builtin.template:', 'src: templates/httpd.conf_{{ ansible_os_family }}.j2', 'dest: /etc/httpd/conf/httpd.conf', 'group: httpd', 'mode: "0640"'] },
        { t: 'code', lang: 'yaml', code: `- name: Ensure the default Apache port is 8080
  ansible.builtin.lineinfile:
    path: /etc/httpd/conf/httpd.conf
    regexp: '^Listen '
    insertafter: '^#Listen '
    line: Listen 8080

- name: Ensure php extension matches new pattern
  ansible.builtin.lineinfile:
    path: /etc/httpd/conf/httpd.conf
    search_string: <FilesMatch ".php[45]?$">
    insertafter: '^\\t<Location \\/>\\n'
    line: "        <FilesMatch \\".php[34]?$\\">"` }
      ] },
    { title: 'Group tasks with same behaviour and same conditions attributes', src: [211],
      blocks: [
        { t: 'text', html: 'Blocks' },
        { t: 'code', lang: 'yaml', code: `tasks:
- name: Install httpd and memcached
  ansible.builtin.dnf:
    name: [httpd, memcached]
    state: present
  when: ansible_facts['distribution'] == 'CentOS'
  become: true
  become_user: root
  ignore_errors: true

- name: Apply the foo config template
  ansible.builtin.template:
    src: templates/src.j2
    dest: /etc/foo.conf
  when: ansible_facts['distribution'] == 'CentOS'
  become: true
  become_user: root
  ignore_errors: true

- name: Start service bar and enable it
  ansible.builtin.service:
    name: bar
    state: started
    enabled: true
  when: ansible_facts['distribution'] == 'CentOS'
  become: true
  become_user: root
  ignore_errors: true` },
        { t: 'code', lang: 'yaml', code: `tasks:
- name: Install, configure, and start Apache
  block:
    - name: Install httpd and memcached
      ansible.builtin.dnf:
        name: [httpd, memcached]
        state: present
    - name: Apply the foo config template
      ansible.builtin.template:
        src: templates/src.j2
        dest: /etc/foo.conf
    - name: Start service bar and enable it
      ansible.builtin.service:
        name: bar
        state: started
        enabled: true
  when: ansible_facts['distribution'] == 'CentOS'
  become: true
  become_user: root
  ignore_errors: true` }
      ] },
    { title: 'Playbook tags', src: [212],
      blocks: [
        { t: 'text', html: 'Add tags to task to be able to run only part of large and complex playbook' },
        { t: 'text', html: 'Tags task, block, play or role' },
        { t: 'code', lang: 'yaml', code: `- name: Install chrony
  ansible.builtin.dnf:
    name: chrony
    state: present
  tags: ntp

- name: Configure chrony
  ansible.builtin.template:
    src: chrony.conf.j2
    dest: /etc/chrony.conf
  notify:
  - restart chronyd
  tags: ntp

- name: Enable and run chronyd
  ansible.builtin.service:
    name: chronyd
    state: started
    enabled: true
  tags: ntp

- name: Install NFS utils
  ansible.builtin.dnf:
    name: nfs-utils
    state: present
  tags: filesharing` },
        { t: 'code', lang: 'yaml', code: `- name: NTP
  tags: ntp
  block:
  - name: Install chrony
    ansible.builtin.dnf:
      name: chrony
      state: present

  - name: Configure chrony
    ansible.builtin.template:
      src: chrony.conf.j2
      dest: /etc/chrony.conf
    notify:
    - restart chronyd

  - name: Enable and run chronyd
    ansible.builtin.service:
      name: chronyd
      state: started
      enabled: true

- name: Install NFS utils
  ansible.builtin.dnf:
    name: nfs-utils
    state: present
  tags: filesharing` }
      ] },
    { title: 'Loops', src: [213],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Prefere “loop” instead of “with_item”
- vars:
     tag_data:
           -  Environment
           -  Application` },
        { t: 'code', lang: 'yaml', code: `With_dict => loop + dict2items
- vars:
    tag_data:
      Environment: dev
      Application: payment` },
        { t: 'code', lang: 'yaml', code: `- name: Using with_
  ansible.builtin.debug:
    msg: "{{ item }}"
  with_item:  tag_data` },
        { t: 'code', lang: 'yaml', code: `- name: Using loop
  ansible.builtin.debug:
    msg: "{{ item }}"
  loop: "{{ tag_data }}"` },
        { t: 'code', lang: 'yaml', code: `- name: Using with_
  ansible.builtin.debug:
    msg: "{{ item.key }} - {{ item.value }}"
  with_dict: "{{ tag_data }}"` },
        { t: 'code', lang: 'yaml', code: `- name: Using dict2items
  ansible.builtin.debug:
    msg: "{{ item.key }} - {{ item.value }}"
  loop: "{{ tag_data | dict2items }}"` },
        { t: 'code', lang: 'yaml', code: `With_flattened => loop + flatten
- vars:
    tag_data:
      - Environment
      - Application` },
        { t: 'code', lang: 'yaml', code: `- name: Using with_
  ansible.builtin.debug:
    msg: "{{ item.key }} - {{ item.value }}"
  with_flatten: "{{ tag_data }}"` },
        { t: 'code', lang: 'yaml', code: `- name: Using dict2items
  ansible.builtin.debug:
    msg: "{{ item.key }} - {{ item.value }}"
  loop: "{{ tag_data | flatten(1) }}"` },
        { t: 'code', lang: 'yaml', code: `With_indexed_item => loop control
- vars:
    tag_data:
      - Environment
      - Application` },
        { t: 'code', lang: 'yaml', code: `- name: Using with_
  ansible.builtin.debug:
    msg: "{{ item.0 }} - {{ item.1 }}"
  with_indexed_items: "{{ tag_data }}"` },
        { t: 'code', lang: 'yaml', code: `- name: Using dict2items
  ansible.builtin.debug:
    msg: "{{ index }} - {{ item }}"
  loop: "{{ tag_data | flatten(1) }}"
Loop_control:
  loop_var: index` }
      ] },
    { title: 'Lint + Molecule', src: [214],
      blocks: [
        { t: 'text', html: 'Playbooks and roles syntax and prerequisites must be controlled by Lint (yamllint and ansible-lint, run separately)' },
        { t: 'text', html: 'Playbooks and roles execution must control by Molecule' },
        { t: 'code', lang: 'console', code: `$ vi molecule/default/molecule.yml
---
dependency:
  name: galaxy
driver:
  name: podman
platforms:
  - name: rhel9
    image: registry.access.redhat.com/ubi9/ubi-init
    tmpfs:
      - /run
      - /tmp
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:ro
    capabilities:
      - SYS_ADMIN
    command: "/usr/sbin/init"
    pre_build_image: true
provisioner:
  name: ansible
  config_options:
    defaults:
      interpreter_python: auto_silent
      callbacks_enabled: profile_tasks, timer
    ssh_connection:
      pipelining: false
verifier:
  name: ansible` }
      ] },
    { title: 'If vars are common across environments/inventory', src: [215],
      blocks: [
        { t: 'text', html: 'hosts_production                     # inventory file' },
        { t: 'text', html: 'hosts_staging                            # inventory file' },
        { t: 'text', html: 'group_vars/' },
        { t: 'bullets', items: ['group1.yml             # here we assign variables to particular groups', 'group2.yml'] },
        { t: 'text', html: 'host_vars/' },
        { t: 'bullets', items: ['hostname1.yml          # here we assign variables to particular systems', 'hostname2.yml'] },
        { t: 'text', html: 'templates/' },
        { t: 'text', html: 'library/                  # if any custom modules, put them here (optional)' },
        { t: 'text', html: 'module_utils/             # if any custom module_utils to support modules, put them here (optional)' },
        { t: 'text', html: 'filter_plugins/           # if any custom filter plugins, put them here (optional)' },
        { t: 'text', html: 'site.yml                  # master playbook' },
        { t: 'text', html: 'webservers.yml            # playbook for webservers role' },
        { t: 'text', html: 'dbservers.yml             # playbook for dbservers role' },
        { t: 'text', html: 'fooapp.yml                # playbook for foo app' },
        { t: 'text', html: 'roles/' },
        { t: 'text', html: 'Directory Layout' },
        { t: 'text', html: '<b>If vars are dependent across environments/inventory</b>' },
        { t: 'text', html: 'inventories/' },
        { t: 'bullets', items: ['production/', 'hosts               # inventory file for production servers', 'group_vars/', 'group1.yml       # here we assign variables to particular groups', 'group2.yml', 'host_vars/', 'hostname1.yml    # here we assign variables to particular systems', 'hostname2.yml'] },
        { t: 'bullets', items: ['staging/', 'hosts               # inventory file for staging environment', 'group_vars/', 'group1.yml       # here we assign variables to particular groups', 'group2.yml', 'host_vars/', 'stagehost1.yml   # here we assign variables to particular systems', 'stagehost2.yml'] },
        { t: 'text', html: 'templates/' },
        { t: 'text', html: 'library/' },
        { t: 'text', html: 'module_utils/' },
        { t: 'text', html: 'filter_plugins/' },
        { t: 'text', html: 'site.yml' },
        { t: 'text', html: 'webservers.yml' },
        { t: 'text', html: 'dbservers.yml' },
        { t: 'text', html: 'roles/' }
      ] },
    { title: 'Roles are individual projects', src: [216],
      blocks: [
        { t: 'text', html: 'Must be set as reusable and sharable' },
        { t: 'text', html: 'version via git independently' },
        { t: 'text', html: '<b>Roles are now part of collections:</b>' },
        { t: 'bullets', items: ['#ansible-galaxy collection init my_namespace.my_collection'] },
        { t: 'text', html: 'collection/' },
        { t: 'text', html: '├── docs/' },
        { t: 'text', html: '├── galaxy.yml' },
        { t: 'text', html: '├── meta/' },
        { t: 'text', html: '│   └── runtime.yml' },
        { t: 'text', html: '├── plugins/' },
        { t: 'text', html: '│   ├── modules/' },
        { t: 'text', html: '│   │   └── module1.py' },
        { t: 'text', html: '│   ├── inventory/' },
        { t: 'text', html: '│   └── .../' },
        { t: 'text', html: '├── README.md' },
        { t: 'text', html: '├── roles/' },
        { t: 'text', html: '│   ├── role1/' },
        { t: 'text', html: '│   ├── role2/' },
        { t: 'text', html: '│   └── .../' },
        { t: 'text', html: '├── playbooks/' },
        { t: 'text', html: '│   ├── files/' },
        { t: 'text', html: '│   ├── vars/' },
        { t: 'text', html: '│   ├── templates/' },
        { t: 'text', html: '│   └── tasks/' },
        { t: 'text', html: '└── tests/' },
        { t: 'text', html: 'Roles and collections' }
      ] },
    { title: 'Directory Layout', src: [217],
      blocks: [
        { t: 'code', lang: 'console', code: `Use the directory layout based on the Galaxy/Molecule recommendation inside the collection:

# ansible-galaxy role init myRole` },
        { t: 'text', html: '<b>Documents the role by describing:</b>' },
        { t: 'bullets', items: ['The context of the role', 'What the role do', 'What the role NOT do', 'The list of usable vars with their default values', 'The list of tags available and their meanings', 'Examples how to use it'] },
        { t: 'text', html: 'Use the “common” specific role name to define default values for all the subsequent roles. These values can be overridden by the roles settings' },
        { t: 'text', html: 'Define in tests directory list of playbooks, Inventory, vars… to test and validate role individually.' },
        { t: 'text', html: 'These testing playbooks must be run by the CI/CD pipeline for validation.' },
        { t: 'code', lang: 'text', code: `molecule init scenario  # run inside the role directory` },
        { t: 'code', lang: 'text', code: `myRole
├── defaults
│   └── main.yml
├── files
├── handlers
│   └── main.yml
├── meta
│   └── main.yml
├── molecule
│   └── default
│       ├── converge.yml
│       ├── create.yml
│       ├── destroy.yml
│       ├── molecule.yml
│       └── verify.yml
├── README.md
├── tasks
│   └── main.yml
├── templates
├── tests
│   ├── inventory
│   └── test.yml
└── vars
    └── main.yml` }
      ] },
    { title: 'Link role instead of import', src: [218],
      blocks: [
        { t: 'text', html: 'Reference a gitted version of the role to be uptodate' },
        { t: 'bullets', items: ['Or the internal galaxy one if deployed'] },
        { t: 'text', html: 'Role import' },
        { t: 'code', lang: 'yaml', code: `#roles/requirements.yml
---
- src: https://git.example.com/my-ansible-roles/role1.git
  scm: git
  version: master
  name: role1` }
      ] },
    { title: 'Using a private automation hub provides', src: [219],
      blocks: [
        { t: 'bullets', items: ['An internal access to Galaxy roles / collections', 'An internal access to home made roles / collections', 'Access control to roles / collections', 'An approbation life cycle'] },
        { t: 'text', html: '<b>Galaxy NG/ automation hub</b>' },
        { t: 'text', html: 'capture historique (schéma d\'architecture)' },
        { t: 'img', file: 'assets/img/s219-1.png', alt: 'Capture historique d\'un schéma d\'architecture : private automation hub (Galaxy NG)' }
      ] },
    { title: 'Facts Gathering', src: [221],
      blocks: [
        { t: 'text', html: 'Facts are gathered on top of ALL Playbook/Plays. It connects to Every servers and collects many information.' },
        { t: 'text', html: 'If none of these facts are required for the play, it is wise to disable it:' },
        { t: 'text', html: 'Configure Playbook with:' },
        { t: 'text', html: 'gather_facts: False' },
        { t: 'text', html: '<b>Running multiple plays:</b>' },
        { t: 'bullets', items: ['activate the gather facts caching', 'gather_facts: true =&gt; only once per playbook'] },
        { t: 'code', lang: 'console', code: `$ time ansible-playbook site.yml
PLAY [Deploying Web Server] *********************
TASK [Gathering Facts] **************************
ok: [node1]
...<output removed>...
PLAY RECAP **************************************
node1: ok=9 changed=4 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0
ansible-playbook site.yml 30.03s user 0.93s system 25% cpu 15.526 total` },
        { t: 'code', lang: 'console', code: `$ time ansible-playbook site.yml
PLAY [Deploying Web Server] ****************
...<output removed>...
PLAY RECAP **************************************
node1: ok=8 changed=4 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0
ansible-playbook site.yml 20.96s user 1.00s system 26% cpu 14.992 total` }
      ] },
    { title: 'Ssh is time consuming while establishing', src: [222],
      blocks: [
        { t: 'code', lang: 'ini', code: `ControlMaster helps by using the same network connection for multiple session
ControlPersist makes an unused network connection opened for future uses

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
Pipelining = True

By default SSH checks the SSH host keys to prevent spoofing or man-in-the-middle attacks, which takes time.
It can be disabled, but this removes that protection: reserve it for short-lived labs, otherwise prefer a pre-filled known_hosts file.

[defaults]
host_key_checking = False` },
        { t: 'text', html: 'Connection' }
      ] },
    { title: 'Strategy', src: [223],
      blocks: [
        { t: 'text', html: 'By default, Ansible use linear strategy : runs tasks on all servers and wait for the tasks to finish on all servers before running the next task.' },
        { t: 'text', html: 'This is that, the delay of the task is the time of the slowest executed task.' },
        { t: 'text', html: 'When all the tasks have no relation between all servers, they can be run independently with the strategy free' },
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 570 326" role="img" aria-labelledby="m16-svg1-t" aria-describedby="m16-svg1-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m16-svg1-t">Stratégie : tâches 1 à 3 sur les hôtes A, B et C</title><desc id="m16-svg1-d">Deux chronologies : en stratégie linear, chaque tâche attend la fin de la plus lente sur tous les hôtes ; en stratégie free, chaque hôte enchaîne ses tâches 1 à 3 sans attendre les autres.</desc><defs><marker id="ar-m16-svg1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="96" y="22" width="56" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="124" y="35" text-anchor="middle" font-size="12">Task 1</text><rect x="210" y="22" width="104" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="262" y="35" text-anchor="middle" font-size="12">Task 2</text><rect x="326" y="22" width="52" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="352" y="35" text-anchor="middle" font-size="12">Task 3</text><rect x="14" y="14" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="27" text-anchor="middle" font-size="12" font-weight="700">Host A</text><rect x="96" y="56" width="100" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="146" y="69" text-anchor="middle" font-size="12">Task 1</text><rect x="210" y="56" width="68" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="244" y="69" text-anchor="middle" font-size="12">Task 2</text><rect x="326" y="56" width="82" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="367" y="69" text-anchor="middle" font-size="12">Task 3</text><rect x="14" y="48" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="61" text-anchor="middle" font-size="12" font-weight="700">Host B</text><rect x="96" y="88" width="56" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="124" y="101" text-anchor="middle" font-size="12">Task 1</text><rect x="210" y="88" width="78" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="249" y="101" text-anchor="middle" font-size="12">Task 2</text><rect x="326" y="88" width="216" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="434" y="101" text-anchor="middle" font-size="12">Task 3</text><rect x="14" y="80" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="93" text-anchor="middle" font-size="12" font-weight="700">Host C</text><rect x="96" y="214" width="56" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="124" y="227" text-anchor="middle" font-size="12">Task 1</text><rect x="162" y="214" width="104" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="214" y="227" text-anchor="middle" font-size="12">Task 2</text><rect x="14" y="206" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="219" text-anchor="middle" font-size="12" font-weight="700">Host A</text><rect x="96" y="248" width="100" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="146" y="261" text-anchor="middle" font-size="12">Task 1</text><rect x="206" y="248" width="68" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="240" y="261" text-anchor="middle" font-size="12">Task 2</text><rect x="280" y="248" width="82" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="321" y="261" text-anchor="middle" font-size="12">Task 3</text><rect x="14" y="240" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="253" text-anchor="middle" font-size="12" font-weight="700">Host B</text><rect x="96" y="280" width="56" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="124" y="293" text-anchor="middle" font-size="12">Task 1</text><rect x="162" y="280" width="78" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="201" y="293" text-anchor="middle" font-size="12">Task 2</text><rect x="14" y="272" width="100" height="36" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="64" y="285" text-anchor="middle" font-size="12" font-weight="700">Host C</text><rect x="274" y="214" width="52" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="300" y="227" text-anchor="middle" font-size="12">Task 3</text><rect x="248" y="280" width="216" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="356" y="293" text-anchor="middle" font-size="12">Task 3</text></svg>' }
      ] },
    { title: 'Parallelism', src: [224],
      blocks: [
        { t: 'text', html: 'Strategy: Free' },
        { t: 'text', html: 'Fork: 6' },
        { t: 'text', html: 'Strategy: Free' },
        { t: 'text', html: 'Fork: 3' },
        { t: 'text', html: 'Strategy: Linear' },
        { t: 'text', html: 'Fork: 3' },
        { t: 'text', html: 'Split the server list in multiple batches:' },
        { t: 'text', html: 'By default, each tasks are split in batch of 5; wait for the batch to complete and then run the task again with the next batch.' },
        { t: 'text', html: 'Increase the FORK value to reduce the waiting time' },
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 933 309" role="img" aria-labelledby="m16-svg2-t" aria-describedby="m16-svg2-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m16-svg2-t">Parallélisme : stratégie et nombre de forks</title><desc id="m16-svg2-d">Trois chronologies : Strategy Linear avec Fork 3, Strategy Free avec Fork 3 et Strategy Free avec Fork 6 ; les hôtes sont traités par lots, un fork plus élevé réduit l\'attente.</desc><defs><marker id="ar-m16-svg2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="24" y="166" width="887" height="130" rx="4" fill="none" stroke="var(--border)"/><text x="30" y="180" font-size="12" font-weight="700">Strategy: FreeFork: 6</text><rect x="24" y="88" width="887" height="67" rx="4" fill="none" stroke="var(--border)"/><text x="30" y="102" font-size="12" font-weight="700">Strategy: FreeFork: 3</text><rect x="24" y="7" width="887" height="72" rx="4" fill="none" stroke="var(--border)"/><text x="30" y="21" font-size="12" font-weight="700">Strategy: LinearFork: 3</text><rect x="248" y="96" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="109" text-anchor="middle" font-size="12">Task 1</text><rect x="291" y="96" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="325" y="109" text-anchor="middle" font-size="12">Task 2</text><rect x="193" y="91" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="104" text-anchor="middle" font-size="12" font-weight="700">Host: A</text><rect x="248" y="117" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="280" y="130" text-anchor="middle" font-size="12">Task 1</text><rect x="318" y="117" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="340" y="130" text-anchor="middle" font-size="12">Task 2</text><rect x="367" y="117" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="394" y="130" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="111" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="124" text-anchor="middle" font-size="12" font-weight="700">Host: B</text><rect x="248" y="139" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="152" text-anchor="middle" font-size="12">Task 1</text><rect x="291" y="139" width="50" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="316" y="152" text-anchor="middle" font-size="12">Task 2</text><rect x="193" y="133" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="146" text-anchor="middle" font-size="12" font-weight="700">Host: C</text><rect x="364" y="96" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="109" text-anchor="middle" font-size="12">Task 3</text><rect x="347" y="139" width="140" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="417" y="152" text-anchor="middle" font-size="12">Task 3</text><rect x="248" y="20" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="33" text-anchor="middle" font-size="12">Task 1</text><rect x="322" y="20" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="356" y="33" text-anchor="middle" font-size="12">Task 2</text><rect x="397" y="20" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="414" y="33" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="15" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="28" text-anchor="middle" font-size="12" font-weight="700">Host: A</text><rect x="248" y="41" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="280" y="54" text-anchor="middle" font-size="12">Task 1</text><rect x="322" y="41" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="344" y="54" text-anchor="middle" font-size="12">Task 2</text><rect x="397" y="41" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="424" y="54" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="36" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="49" text-anchor="middle" font-size="12" font-weight="700">Host: B</text><rect x="248" y="62" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="75" text-anchor="middle" font-size="12">Task 1</text><rect x="322" y="62" width="50" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="347" y="75" text-anchor="middle" font-size="12">Task 2</text><rect x="397" y="62" width="140" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="468" y="75" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="57" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="70" text-anchor="middle" font-size="12" font-weight="700">Host: C</text><rect x="572" y="20" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="592" y="33" text-anchor="middle" font-size="12">Task 1</text><rect x="644" y="20" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="661" y="33" text-anchor="middle" font-size="12">Task 2</text><rect x="546" y="15" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="578" y="28" text-anchor="middle" font-size="12">D</text><rect x="572" y="41" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="604" y="54" text-anchor="middle" font-size="12">Task 1</text><rect x="644" y="41" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="666" y="54" text-anchor="middle" font-size="12">Task 2</text><rect x="721" y="41" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="748" y="54" text-anchor="middle" font-size="12">Task 3</text><rect x="546" y="36" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="578" y="49" text-anchor="middle" font-size="12">E</text><rect x="572" y="62" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="590" y="75" text-anchor="middle" font-size="12">Task 1</text><rect x="644" y="62" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="678" y="75" text-anchor="middle" font-size="12">Task 2</text><rect x="721" y="62" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="738" y="75" text-anchor="middle" font-size="12">Task 3</text><rect x="546" y="57" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="578" y="70" text-anchor="middle" font-size="12">F</text><rect x="509" y="96" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="530" y="109" text-anchor="middle" font-size="12">Task 1</text><rect x="557" y="96" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="574" y="109" text-anchor="middle" font-size="12">Task 2</text><rect x="596" y="96" width="136" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="664" y="109" text-anchor="middle" font-size="12">Task 3</text><rect x="488" y="91" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="521" y="104" text-anchor="middle" font-size="12">D</text><rect x="509" y="117" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="542" y="130" text-anchor="middle" font-size="12">Task 1</text><rect x="579" y="117" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="601" y="130" text-anchor="middle" font-size="12">Task 2</text><rect x="627" y="117" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="654" y="130" text-anchor="middle" font-size="12">Task 3</text><rect x="488" y="111" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="521" y="124" text-anchor="middle" font-size="12">E</text><rect x="508" y="139" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="526" y="152" text-anchor="middle" font-size="12">Task 1</text><rect x="548" y="139" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="582" y="152" text-anchor="middle" font-size="12">Task 2</text><rect x="622" y="139" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="639" y="152" text-anchor="middle" font-size="12">Task 3</text><rect x="488" y="133" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="521" y="146" text-anchor="middle" font-size="12">F</text><rect x="720" y="20" width="136" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="788" y="33" text-anchor="middle" font-size="12">Task 3</text><rect x="248" y="171" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="184" text-anchor="middle" font-size="12">Task 1</text><rect x="291" y="171" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="325" y="184" text-anchor="middle" font-size="12">Task 2</text><rect x="193" y="166" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="179" text-anchor="middle" font-size="12" font-weight="700">Host A</text><rect x="248" y="193" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="280" y="206" text-anchor="middle" font-size="12">Task 1</text><rect x="318" y="193" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="340" y="206" text-anchor="middle" font-size="12">Task 2</text><rect x="367" y="193" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="394" y="206" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="188" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="201" text-anchor="middle" font-size="12" font-weight="700">Host B</text><rect x="248" y="214" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="227" text-anchor="middle" font-size="12">Task 1</text><rect x="291" y="214" width="50" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="316" y="227" text-anchor="middle" font-size="12">Task 2</text><rect x="193" y="209" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="222" text-anchor="middle" font-size="12" font-weight="700">Host C</text><rect x="364" y="171" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="184" text-anchor="middle" font-size="12">Task 3</text><rect x="347" y="214" width="140" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="417" y="227" text-anchor="middle" font-size="12">Task 3</text><rect x="247" y="235" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="267" y="248" text-anchor="middle" font-size="12">Task 1</text><rect x="293" y="235" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="310" y="248" text-anchor="middle" font-size="12">Task 2</text><rect x="334" y="235" width="136" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="402" y="248" text-anchor="middle" font-size="12">Task 3</text><rect x="192" y="230" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="224" y="243" text-anchor="middle" font-size="12" font-weight="700">Host D</text><rect x="248" y="258" width="65" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="280" y="271" text-anchor="middle" font-size="12">Task 1</text><rect x="317" y="258" width="44" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="339" y="271" text-anchor="middle" font-size="12">Task 2</text><rect x="366" y="258" width="53" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="393" y="271" text-anchor="middle" font-size="12">Task 3</text><rect x="193" y="253" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="226" y="266" text-anchor="middle" font-size="12" font-weight="700">Host E</text><rect x="248" y="278" width="36" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="266" y="291" text-anchor="middle" font-size="12">Task 1</text><rect x="289" y="278" width="67" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="323" y="291" text-anchor="middle" font-size="12">Task 2</text><rect x="364" y="278" width="33" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="380" y="291" text-anchor="middle" font-size="12">Task 3</text><rect x="195" y="273" width="65" height="23" rx="4" fill="var(--surface)" stroke="var(--border)"/><text x="227" y="286" text-anchor="middle" font-size="12" font-weight="700">Host F</text></svg>' }
      ] },
    { title: 'Asynchroneous', src: [225],
      blocks: [
        { t: 'text', html: 'A long duration task can be not blocking as other task can be run in parallel:' },
        { t: 'code', lang: 'yaml', code: `tasks:
  - name: Initiate custom snapshot take long time
    shell: "/opt/diskutils/snapshot.sh init"
    async: 120 # Maximum allowed time in Seconds
    poll: 05 # Polling Interval in Seconds
    register: snapshot_job_id
  - name: other task
    ….
 - name: other task
    ….
  - name: Check on an async task
    async_status: jid: "{{snapshot_job_id}}"
    register: job_result
    until: job_result.finished
    retries: 100 # Max checks
    delay: 10 # Waits 10 seconds between checks` },
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 586 154" role="img" aria-labelledby="m16-svg3-t" aria-describedby="m16-svg3-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m16-svg3-t">Tâche asynchrone : exécution en parallèle</title><desc id="m16-svg3-d">Deux chronologies : les tâches 1 à 3 en séquence, puis avec une tâche longue lancée en asynchrone pendant que les tâches suivantes s\'exécutent, avec une vérification (check) à la fin.</desc><defs><marker id="ar-m16-svg3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="16" y="16" width="288" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="160" y="29" text-anchor="middle" font-size="12">Task 1</text><rect x="312" y="16" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="332" y="29" text-anchor="middle" font-size="12">Task 2</text><rect x="361" y="16" width="193" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="458" y="29" text-anchor="middle" font-size="12">Task 3</text><rect x="57" y="89" width="288" height="38" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="201" y="102" text-anchor="middle" font-size="12">Task 1</text><rect x="281" y="102" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="302" y="115" text-anchor="middle" font-size="12">check</text><rect x="65" y="102" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="86" y="115" text-anchor="middle" font-size="12">Task 2</text><rect x="115" y="102" width="160" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="195" y="115" text-anchor="middle" font-size="12">Task 3</text><rect x="16" y="89" width="41" height="38" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="36" y="102" text-anchor="middle" font-size="12">Task 1</text><rect x="323" y="102" width="41" height="18" rx="4" fill="var(--accent-soft)" stroke="var(--accent)"/><text x="344" y="115" text-anchor="middle" font-size="12">check</text></svg>' }
      ] },
    { title: 'Tasks', src: [226],
      blocks: [
        { t: 'text', html: 'Avoid repetitive tasks or loops when the native multivalue module feature is available' },
        { t: 'code', lang: 'yaml', code: `  - name: install the latest version of nginx
    ansible.builtin.dnf:
      name: nginx
      state: latest
  - name: install the latest version of postgresql
    ansible.builtin.dnf:
      name: postgresql
      state: latest
  - name: install the latest version of postgresql-server
    ansible.builtin.dnf:
      name: postgresql-server
      state: latest` },
        { t: 'code', lang: 'yaml', code: `  - name: install the latest versions
    ansible.builtin.dnf:
      name: "{{ item }}"
      state: latest
    loop:
    - nginx
    - postgresql
    - postgresql-server` },
        { t: 'code', lang: 'yaml', code: `  - name: install the latest versions
    ansible.builtin.dnf:
      name:
        - nginx
        - postgresql
        - postgresql-server
      state: latest` },
        { t: 'text', html: 'Avoid using shell or command tasks, always check if native module exists' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle syntaxe de boucle la slide 203 recommande-t-elle ?',
        options: ['loop', 'with_items', 'with_dict'], answer: 0,
        explain: 'Slide 203 : « Prefere “loop” instead of “with_item” » (le mot-clé est with_items ; la slide écrit with_item) ; <code>with_dict</code> se remplace par <code>loop</code> et <code>dict2items</code>.', ref: [213] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Comment éviter la collecte des facts quand ils ne sont pas nécessaires au play ?',
        options: ['gather_facts: true', 'strategy: free', 'gather_facts: False'], answer: 2,
        explain: 'Slide 211 : « If none of these facts are required for the play, it is wise to disable it » avec <code>gather_facts: False</code>.', ref: [221] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quels outils la slide 204 associe-t-elle au contrôle de la syntaxe et à celui de l\'exécution ?',
        options: ['ansible-doc pour la syntaxe, ansible-galaxy pour l\'exécution', 'yamllint et ansible-lint pour la syntaxe, Molecule pour l\'exécution', 'Molecule pour la syntaxe, yamllint pour l\'exécution'], answer: 1,
        explain: 'Slide 204 : la syntaxe et les prérequis sont contrôlés par Lint (yamllint et ansible-lint, lancés séparément) et l\'exécution par Molecule.', ref: [214] }
    ] }
  ],
  takeaways: [
    { html: 'Chiffrer une variable avec <code>ansible-vault encrypt_string</code> plutôt qu\'un fichier entier.', ref: [208] },
    { html: 'Préférer pousser un fichier complet construit avec un template Jinja2 plutôt que modifier un fichier existant.', ref: [210] },
    { html: 'Grouper les tâches qui ont le même comportement et les mêmes attributs de conditions avec <code>block</code>.', ref: [211] },
    { html: 'Préférer <code>loop</code> à with_items.', ref: [213] },
    { html: 'Les playbooks et les rôles se contrôlent avec Lint (yamllint et ansible-lint) et avec Molecule.', ref: [214] },
    { html: 'Désactiver la collecte des facts quand elle est inutile avec <code>gather_facts: False</code>.', ref: [221] }
  ]
});
