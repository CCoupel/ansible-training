/* Module 02 — Inventory (slides PPTX 13 à 29). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm02', num: 2, emoji: '📇',
  title: 'Inventory',
  tagline: 'Lister les hôtes gérés par Ansible, les organiser en groupes et choisir le format de l\'inventaire.',
  objectives: [
    { html: 'Définir un inventaire : la liste des hôtes gérés par Ansible, éventuellement organisés en groupes.', ref: [14] },
    { html: 'Structurer des hôtes en groupes à plat ou en arborescence avec la section <code>:children</code>.', ref: [15, 16] },
    { html: 'Comparer les formats INI, YAML et JSON : lisibilité, hiérarchie, commentaires, vitesse d\'analyse.', ref: [17, 19, 21, 23] },
    { html: 'Écrire le même inventaire aux formats INI, JSON et YAML.', ref: [25, 26, 27] },
    { html: 'Tester un inventaire avec <code>ansible-inventory</code>, l\'utiliser avec <code>-i</code> et le limiter avec <code>-l</code>.', ref: [29] }
  ],
  slides: [
    { title: 'Inventory', src: [13], blocks: [
      { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/inventory_guide/intro_inventory.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/inventory_guide/intro_inventory.html</a>' }
    ] },
    { title: 'What is an Inventory?', src: [14], blocks: [
      { t: 'bullets', items: [
        '<b>Definition:</b> The list of managed nodes (or hosts) that Ansible configures.',
        '<b>Formats:</b> Various formats, with INI and YAML.',
        '<b>Default Location:</b> The default inventory file is located at /etc/ansible/hosts.',
        '<b>Groups:</b> Hosts can be organized into groups to simplify management and task execution.',
        '<b>Dynamic Inventory:</b> Plugins to generate inventories from external sources'
      ] }
    ] },
    { title: 'Inventory EXAMPLE : FLAT', src: [15], layout: 'two', blocks: [
      { t: 'table', head: ['Projet1', 'APP 1', 'APP2'], rows: [
        ['WEB', 'SRV1-1 SRV1-2', 'SRV2-1 SRV2-2'],
        ['DB', 'SRV1-11 SRV1-12', 'SRV2-11 SRV2-12']
      ] },
      { t: 'code', lang: 'ini', code: `[WEB]
SRV1-1
SRV1-2
SRV2-1
SRV2-2

[DB]
SRV1-11
SRV1-12
SRV2-11
SRV2-12

[APP1]
SRV1-1
SRV1-2
SRV1-11
SRV1-12

[APP2]
SRV1-1
SRV1-2
SRV1-11
SRV1-12
...` }
    ] },
    { title: 'Inventory EXAMPLE : Tree', src: [16], layout: 'two', blocks: [
      { t: 'table', wide: true, head: ['Projet1', 'APP 1', 'APP2'], rows: [
        ['WEB', 'SRV1-1 SRV1-2', 'SRV2-1 SRV2-2'],
        ['DB', 'SRV1-11 SRV1-12', 'SRV2-11 SRV2-12']
      ] },
      { t: 'code', lang: 'ini', code: `[APP1-web]
SRV1-1
SRV1-2

[APP1-db]
SRV1-3
SRV1-4

[APP2-web]
SRV2-[1:2]

[APP2-db]
SRV2-[11:12]` },
      { t: 'code', lang: 'ini', code: `[APP1:children]
APP1-web
APP1-db

[APP2:children]
APP2-web
APP2-db

[WEB:children]
APP1-web
APP2-web

[DB:children]
APP1-db
APP2-db` }
    ] },
    { title: 'Format INI:', src: [17], blocks: [
      { t: 'text', html: '<b>History</b>' },
      { t: 'bullets', items: ['Created in the early 1980s', 'Initially used by MS-DOS and Windows', 'Name comes from "initialization"', 'Widely used for simple configuration files'] },
      { t: 'text', html: '<b>Advantages</b>' },
      { t: 'bullets', items: ['Simple and easy to read', 'Human-friendly format', 'Minimal learning curve', 'Good for basic configurations', 'Supported by many programming languages'] },
      { t: 'text', html: '<b>Disadvantages</b>' },
      { t: 'bullets', items: ['Limited structure (only two levels of hierarchy)', 'No standardization', 'No support for complex data types', 'Inconsistent implementations', 'Limited array support'] }
    ] },
    { title: 'Format INI: Example', src: [18], blocks: [
      { t: 'code', lang: 'ini', code: `[database]
host=localhost
port=5432
name=mydb

[server]
ip=192.168.1.1
max_connections=100` }
    ] },
    { title: 'Format JSON:', src: [19], blocks: [
      { t: 'text', html: '<b>History</b>' },
      { t: 'bullets', items: ['Created by Douglas Crockford in 2001', 'Subset of JavaScript object notation', 'Became RFC standard in 2006', 'Now the de facto standard for web APIs'] },
      { t: 'text', html: '<b>Advantages</b>' },
      { t: 'bullets', items: ['Language-independent', 'Easy to parse and generate', 'Strict and predictable syntax', 'Excellent programming language support', 'Perfect for data interchange', 'Fast parsing speed'] },
      { t: 'text', html: '<b>Disadvantages</b>' },
      { t: 'bullets', items: ['No comments support', 'More verbose than YAML', 'Less human-readable for complex structures', 'Strict syntax (trailing commas not allowed)', 'No support for data references', 'Limited data types'] }
    ] },
    { title: 'Format JSON: Example', src: [20], blocks: [
      { t: 'code', lang: 'json', code: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb",
    "users": [
      {
        "name": "admin",
        "rights": ["read", "write"]
      },
      {
        "name": "guest",
        "rights": ["read"]
      }
    ]
  }
}` }
    ] },
    { title: 'Format YAML:', src: [21], blocks: [
      { t: 'text', html: '<b>History</b>' },
      { t: 'bullets', items: ['Created in 2001', 'Name: "YAML Ain\'t Markup Language"', 'Designed to be human-readable', 'Initially popular in Ruby community', 'Widely adopted by DevOps tools (Ansible, Docker, Kubernetes)'] },
      { t: 'text', html: '<b>Advantages</b>' },
      { t: 'bullets', items: ['Very readable and clean syntax', 'Supports complex data structures', 'Allows comments', 'Supports references and anchors', 'Perfect for configuration files', 'Rich data types support'] },
      { t: 'text', html: '<b>Disadvantages</b>' },
      { t: 'bullets', items: ['Indentation-sensitive (can be error-prone)', 'Multiple ways to write the same thing', 'Can be complex for advanced features', 'Parsing can be slower than JSON', 'Whitespace rules can be confusing'] }
    ] },
    { title: 'Format YAML: Example', src: [22], blocks: [
      { t: 'code', lang: 'yaml', code: `database:
  host: localhost
  port: 5432
  name: mydb
  users:
    - name: admin
      rights: [read, write]
    - name: guest
      rights: [read]` }
    ] },
    { title: 'Format Comparison Table:', src: [23], blocks: [
      { t: 'table', head: ['Feature', 'INI', 'YAML', 'JSON'], rows: [
        ['Readability', 'High', 'High', 'Medium'],
        ['Complexity', 'Low', 'High', 'Medium'],
        ['Hierarchy Support', 'Limited', 'Full', 'Full'],
        ['Comments Support', 'Yes', 'Yes', 'No'],
        ['Learning Curve', 'Low', 'Medium', 'Low'],
        ['Parsing Speed', 'Fast', 'Slow', 'Fast'],
        ['Data Types', 'Basic', 'Rich', 'Basic'],
        ['Standardization', 'No', 'Yes', 'Yes']
      ] }
    ] },
    { title: 'Format Use Cases:', src: [24], blocks: [
      { t: 'table', head: ['INI', 'YAML', 'JSON'], rows: [
        ['Simple application configs', 'Ansible playbooks', 'API responses'],
        ['User preferences', 'Docker compose files', 'Web services'],
        ['Basic settings files', 'Kubernetes manifests', 'Data interchange'],
        ['Windows system configs', 'Complex configurations', 'Cross-platform configs'],
        ['', 'CI/CD pipelines', 'Database exports']
      ] }
    ] },
    { title: 'Format INI: Inventory', src: [25], blocks: [
      { t: 'code', lang: 'ini', code: `[all]

[APP1:children]
WEB
DB

[APP2:children]
WEB
DB

[WEB]
srv1-1 ansible_host=192.168.1.101 ansible_user=root
srv1-2 ansible_host=192.168.1.102 ansible_user=root
srv2-1 ansible_host=192.168.1.201 ansible_user=root
srv2-2 ansible_host=192.168.1.202 ansible_user=root

[DB]
srv1-11 ansible_host=192.168.1.111 ansible_user=root
srv1-12 ansible_host=192.168.1.112 ansible_user=root
srv2-11 ansible_host=192.168.1.211 ansible_user=root
srv2-12 ansible_host=192.168.1.212 ansible_user=root` }
    ] },
    { title: 'Format JSON: Inventory', src: [26], blocks: [
      { t: 'code', lang: 'json', code: `{"_meta": { "hostvars": {
    "srv1-1": { "ansible_host": "192.168.1.101", "ansible_user": "root" },
    "srv1-2": { "ansible_host": "192.168.1.102", "ansible_user": "root" },
    "srv1-11": { "ansible_host": "192.168.1.111", "ansible_user": "root" },
    "srv1-12": { "ansible_host": "192.168.1.112", "ansible_user": "root" },
    "srv2-1": { "ansible_host": "192.168.1.201", "ansible_user": "root" },
    "srv2-2": { "ansible_host": "192.168.1.202", "ansible_user": "root" },
    "srv2-11": { "ansible_host": "192.168.1.211", "ansible_user": "root" },
    "srv2-12": { "ansible_host": "192.168.1.212", "ansible_user": "root" }
  } },
"all": { "children": [ "APP1", "APP2"]},
 "APP1": { "children": [ "WEB", "DB"],
           "hosts": ["srv1-1", "srv1-2", "srv1-11", "srv1-12"]
         },
 "APP2": { "children": [ "WEB", "DB"],
           "hosts": ["srv2-1", "srv2-2", "srv2-11", "srv2-12"]
         },
 "WEB": { "hosts": [ "srv1-1", "srv1-2", "srv2-1", "srv2-2"]},
 "DB": { "hosts": [ "srv1-11", "srv1-12", "srv2-11", "srv2-12"]}
}` }
    ] },
    { title: 'Format YAML: Inventory', src: [27], blocks: [
      { t: 'code', lang: 'yaml', code: `all:
  children:
    APP1:
      children:
        WEB:
          hosts:
            srv1-1:
              ansible_host: 192.168.1.101
              ansible_user: root
            srv1-2:
              ansible_host: 192.168.1.102
              ansible_user: root
        DB:
          hosts:
            srv1-11:
              ansible_host: 192.168.1.111
              ansible_user: root
            srv1-12:
              ansible_host: 192.168.1.112
              ansible_user: root
    APP2:
      children:
        WEB:
          hosts:
            srv2-1:
              ansible_host: 192.168.1.201
              ansible_user: root
            srv2-2:
              ansible_host: 192.168.1.202
              ansible_user: root
        DB:
          hosts:
            srv2-11:
              ansible_host: 192.168.1.211
              ansible_user: root
            srv2-12:
              ansible_host: 192.168.1.212
              ansible_user: root` }
    ] },
    { title: 'Dynamic Inventory', src: [28], blocks: [
      { t: 'text', html: '=> DeepDive session' },
      { t: 'bullets', items: [
        '<code>amazon.aws.aws_ec2</code>',
        '<code>azure.azcollection.azure_rm</code>',
        '<code>google.cloud.gcp_compute</code>',
        '<code>openstack.cloud.openstack</code>',
        '<code>vmware.vmware.vms</code> (vCenter)',
        '<code>community.proxmox.proxmox</code>',
        '<code>ovirt.ovirt.ovirt</code>',
        '<code>netbox.netbox.nb_inventory</code>',
        '=> Cloudforms/ManageIQ (legacy integration example)',
        '...'
      ] }
    ], },
    { title: 'Test Inventory:', src: [29],
      notes: 'Exemple de inventaire dynamique',
      blocks: [
        { t: 'code', lang: 'console', code: '# ansible-inventory -i test_inventory --list' },
        { t: 'text', html: '<b>Use Inventory:</b>' },
        { t: 'code', lang: 'console', code: `# ansible-playbook -i 127.0.0.1, my_playbook.yml
# ansible-playbook -i my_Inventory_file.yml my_playbook.yml
# ansible-playbook -i my_Inventory_script.py my_playbook.yml` },
        { t: 'text', html: '<b>Limit Inventory:</b>' },
        { t: 'code', lang: 'console', code: '# ansible-playbook -i my_Inventory_script.py -l Web my_playbook.yml' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Où se trouve le fichier d\'inventaire par défaut d\'Ansible ?',
        options: ['/var/lib/ansible/hosts', '/etc/ansible/hosts', '/etc/ansible/inventory.ini'], answer: 1,
        explain: 'Le fichier d\'inventaire par défaut est <code>/etc/ansible/hosts</code> (cf. slide 14).', ref: [14] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Parmi INI, YAML et JSON, quel format n\'accepte pas les commentaires ?',
        options: ['INI', 'YAML', 'JSON'], answer: 2,
        explain: 'Le tableau comparatif indique « Comments Support : No » pour JSON (cf. slide 23, et « No comments support » en slide 19).', ref: [19, 23] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que fait l\'option <code>-l</code> dans <code>ansible-playbook -i my_Inventory_script.py -l Web my_playbook.yml</code> ?',
        options: ['Elle limite l\'exécution aux hôtes du groupe Web', 'Elle affiche la liste complète des hôtes de l\'inventaire', 'Elle charge un fichier de journal pour l\'exécution'], answer: 0,
        explain: 'Sous « Limit Inventory », la slide 29 utilise <code>-l Web</code> pour limiter l\'inventaire ; la liste complète s\'obtient avec <code>ansible-inventory -i test_inventory --list</code>.', ref: [29] }
    ] }
  ],
  takeaways: [
    { html: 'Un inventaire est la liste des nœuds gérés (les hôtes) qu\'Ansible configure ; les hôtes peuvent être organisés en groupes.', ref: [14] },
    { html: 'Le fichier d\'inventaire par défaut est <code>/etc/ansible/hosts</code>.', ref: [14] },
    { html: 'La section <code>:children</code> permet de construire une arborescence de groupes.', ref: [16, 25] },
    { html: 'INI est simple mais sa structure de données est limitée à deux niveaux de hiérarchie (les groupes s\'imbriquent avec <code>:children</code>) ; YAML et JSON gèrent une hiérarchie complète, et JSON n\'accepte pas les commentaires.', ref: [16, 17, 19, 23] },
    { html: 'Un inventaire dynamique est généré par des plugins à partir de sources externes, par exemple <code>amazon.aws.aws_ec2</code> ou <code>netbox.netbox.nb_inventory</code>.', ref: [14, 28] },
    { html: '<code>ansible-inventory -i test_inventory --list</code> teste un inventaire ; l\'option <code>-l</code> (par exemple <code>-l Web</code>) limite l\'exécution.', ref: [29] }
  ]
});
