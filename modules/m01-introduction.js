/* Module 01 — Introduction (slides PPTX 4 à 12). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm01', num: 1, emoji: '🚀',
  title: 'Introduction',
  tagline: 'Découvrir ce qu\'est Ansible, ses cas d\'usage, son architecture sans agent et ses premières commandes.',
  objectives: [
    { html: 'Décrire Ansible comme un langage d\'automatisation (les playbooks) et un moteur qui les exécute.', ref: [4] },
    { html: 'Citer des cas d\'usage d\'Ansible : gestion de configuration, déploiement d\'applications, provisioning, livraison continue, sécurité et conformité, orchestration.', ref: [5] },
    { html: 'Expliquer pourquoi Ansible est dit sans agent (OpenSSH, WinRM, PSRP).', ref: [6] },
    { html: 'Situer l\'inventaire, les modules, les plugins et les playbooks dans le fonctionnement d\'ansible-core.', ref: [8, 9, 10] },
    { html: 'Lancer une commande ad hoc avec <code>ansible</code> et un playbook avec <code>ansible-playbook</code>.', ref: [11, 12] }
  ],
  slides: [
    { title: 'What is Ansible', src: [4],
      blocks: [
        { t: 'text', html: 'It’s a simple automation language that can perfectly describe an IT application infrastructure in Ansible Playbooks. It’s an automation engine that runs Ansible Playbooks.' },
        { t: 'text', html: 'Ansible automation controller (Red Hat Ansible Automation Platform) and its upstream project AWX are frameworks for controlling, securing and managing your Ansible automation with a UI and restful API.' },
        { t: 'img', file: 'assets/img/s004-1.png', alt: 'Capture de l\'interface web d\'Ansible automation controller (tableau de bord)', caption: 'capture historique (ancienne interface)' }
      ] },
    { title: 'USE CASES', src: [5],
      blocks: [
        { t: 'layers', items: [{ name: 'CONFIG MANAGEMENT', desc: 'Centralizing configuration file management and deployment is a common use case for Ansible, and it’s how many power users are first introduced to the Ansible automation platform.' }, { name: 'APP DEPLOYMENT', desc: 'When you define your application with Ansible, and manage the deployment with automation controller / AWX, teams are able to effectively manage the entire application lifecycle from development to production.' }, { name: 'PROVISIONING', desc: 'Your apps have to live somewhere. If you’re PXE booting and kickstarting bare-metal servers or VMs, or creating virtual or cloud instances from templates, Ansible and automation controller / AWX help streamline the process.' }, { name: 'CONTINUOUS DELIVERY', desc: 'Creating a CI/CD pipeline requires buy-in from numerous teams. You can’t do it without a simple automation platform that everyone in your organization can use. Ansible Playbooks keep your applications properly deployed (and managed) throughout their entire lifecycle.' }, { name: 'SECURITY & COMPLIANCE', desc: 'When you define your security policy in Ansible, scanning and remediation of site-wide security policy can be integrated into other automated processes and instead of being an afterthought, it’ll be integral in everything that is deployed.' }, { name: 'ORCHESTRATION', desc: 'Configurations alone don’t define your environment. You need to define how multiple configurations interact and ensure the disparate pieces can be managed as a whole. Out of complexity and chaos, Ansible brings order.' }] },
        { t: 'gallery', items: [{ t: 'img', file: 'assets/img/s005-1.png', alt: 'Pictogramme 1 (slide 5)' }, { t: 'img', file: 'assets/img/s005-2.png', alt: 'Pictogramme 2 (slide 5)' }, { t: 'img', file: 'assets/img/s005-3.png', alt: 'Pictogramme 3 (slide 5)' }, { t: 'img', file: 'assets/img/s005-4.png', alt: 'Pictogramme 4 (slide 5)' }, { t: 'img', file: 'assets/img/s005-5.png', alt: 'Pictogramme 5 (slide 5)' }, { t: 'img', file: 'assets/img/s005-6.png', alt: 'Pictogramme 6 (slide 5)' }] }
      ] },
    { title: 'SIMPLE', src: [6],
      blocks: [
        { t: 'table', head: ['SIMPLE', 'POWERFUL', 'AGENTLESS'], rows: [['Human readable automation', 'App deployment', 'Agentless architecture'], ['No special coding skills needed', 'Configuration management', 'Uses OpenSSH, WinRM &amp; PSRP'], ['Tasks executed in order', 'Workflow orchestration', 'No agents to exploit or update'], ['<b>Get productive quickly</b>', '<b>Orchestrate the app lifecycle</b>', '<b>More efficient &amp; more secure</b>']] },
        { t: 'gallery', items: [{ t: 'img', file: 'assets/img/s006-1.png', alt: 'Pictogramme 1 (slide 6)' }, { t: 'img', file: 'assets/img/s006-2.png', alt: 'Pictogramme 2 (slide 6)' }, { t: 'img', file: 'assets/img/s006-3.png', alt: 'Pictogramme 3 (slide 6)' }] }
      ] },
    { title: 'DATA IS WRITTEN IN YAML', src: [7],
      blocks: [
        { t: 'bullets', items: ['Tasks are executed sequentially', 'Invokes Ansible modules', 'Idempotency'] },
        { t: 'text', html: '<b>Multi OS, Agentless</b>' },
        { t: 'bullets', items: ['Red Hat Enterprise Linux', 'AIX', 'Sun', 'Windows….'] },
        { t: 'text', html: '<b>Not only servers:</b>' },
        { t: 'bullets', items: ['Network Appliance Big IP F5, OpenVSwitch, Citrix, Cisco…', 'Assets (storage, supervision, ...)'] }
      ] },
    { title: 'HOW ANSIBLE WORKS', src: [8],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 720 500" role="img" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="234" y="223" width="298" height="246" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="383" y="242" text-anchor="middle" font-weight="700">ANSIBLE-CORE (AUTOMATION ENGINE)</text><text x="383" y="258" text-anchor="middle">ansible-core</text><rect x="262" y="338" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="312.0" y="355" text-anchor="middle" font-weight="700">INVENTORY</text><rect x="398" y="338" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="448.0" y="355" text-anchor="middle" font-weight="700">API</text><rect x="262" y="427" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="312.0" y="444" text-anchor="middle" font-weight="700">MODULES</text><rect x="398" y="427" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="448.0" y="444" text-anchor="middle" font-weight="700">PLUGINS</text><rect x="100" y="100" width="140" height="70" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="170.0" y="117" text-anchor="middle" font-weight="700">PUBLIC / PRIVATE</text><text x="170.0" y="134" text-anchor="middle">CLOUD</text><rect x="256" y="100" width="90" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="301.0" y="117" text-anchor="middle" font-weight="700">CMDB</text><rect x="30" y="230" width="110" height="60" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="247" text-anchor="middle" font-weight="700">USERS</text><rect x="30" y="430" width="150" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="105.0" y="447" text-anchor="middle" font-weight="700">ANSIBLE PLAYBOOK</text><rect x="570" y="270" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="287" text-anchor="middle" font-weight="700">HOSTS</text><rect x="570" y="420" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="437" text-anchor="middle" font-weight="700">NETWORKING</text><line x1="170" y1="175" x2="300" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="300" y1="145" x2="310" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="145" y1="260" x2="230" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="185" y1="448" x2="262" y2="440" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="533" y1="290" x2="568" y2="290" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="533" y1="440" x2="568" y2="440" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><rect x="352" y="70" width="345" height="160" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="524.5" y="87" text-anchor="middle" font-weight="700">Inventory:</text><text x="524.5" y="104" text-anchor="middle">Describe the servers/objects organization</text><text x="524.5" y="121" text-anchor="middle">Can be dynamically extracted</text><text x="524.5" y="138" text-anchor="middle">CLOUD:</text><text x="524.5" y="155" text-anchor="middle">AWS EC2, Azure, GCP, VMware,</text><text x="524.5" y="172" text-anchor="middle">OpenStack, Proxmox, oVirt</text><text x="524.5" y="189" text-anchor="middle">CUSTOM CMDB</text></svg>' },
        { t: 'gallery', items: [{ t: 'img', file: 'assets/img/s008-1.png', alt: 'Pictogramme 1 (slide 8)' }, { t: 'img', file: 'assets/img/s008-2.png', alt: 'Pictogramme 2 (slide 8)' }, { t: 'img', file: 'assets/img/s008-3.png', alt: 'Pictogramme 3 (slide 8)' }, { t: 'img', file: 'assets/img/s008-4.png', alt: 'Pictogramme 4 (slide 8)' }, { t: 'img', file: 'assets/img/s008-5.png', alt: 'Pictogramme 5 (slide 8)' }, { t: 'img', file: 'assets/img/s008-6.png', alt: 'Pictogramme 6 (slide 8)' }, { t: 'img', file: 'assets/img/s008-7.png', alt: 'Pictogramme 7 (slide 8)' }, { t: 'img', file: 'assets/img/s008-8.png', alt: 'Pictogramme 8 (slide 8)' }, { t: 'img', file: 'assets/img/s008-9.png', alt: 'Pictogramme 9 (slide 8)' }, { t: 'img', file: 'assets/img/s008-10.png', alt: 'Pictogramme 10 (slide 8)' }] }
      ] },
    { title: 'HOW ANSIBLE WORKS', src: [9],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 720 500" role="img" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="234" y="223" width="298" height="246" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="383" y="242" text-anchor="middle" font-weight="700">ANSIBLE-CORE (AUTOMATION ENGINE)</text><text x="383" y="258" text-anchor="middle">ansible-core</text><rect x="262" y="338" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="312.0" y="355" text-anchor="middle" font-weight="700">INVENTORY</text><rect x="398" y="338" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="448.0" y="355" text-anchor="middle" font-weight="700">API</text><rect x="262" y="427" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="312.0" y="444" text-anchor="middle" font-weight="700">MODULES</text><rect x="398" y="427" width="100" height="24" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="448.0" y="444" text-anchor="middle" font-weight="700">PLUGINS</text><rect x="100" y="100" width="140" height="70" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="170.0" y="117" text-anchor="middle" font-weight="700">PUBLIC / PRIVATE</text><text x="170.0" y="134" text-anchor="middle">CLOUD</text><rect x="256" y="100" width="90" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="301.0" y="117" text-anchor="middle" font-weight="700">CMDB</text><rect x="30" y="230" width="110" height="60" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="85.0" y="247" text-anchor="middle" font-weight="700">USERS</text><rect x="30" y="430" width="150" height="36" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="105.0" y="447" text-anchor="middle" font-weight="700">ANSIBLE PLAYBOOK</text><rect x="570" y="270" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="287" text-anchor="middle" font-weight="700">HOSTS</text><rect x="570" y="420" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="437" text-anchor="middle" font-weight="700">NETWORKING</text><line x1="170" y1="175" x2="300" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="300" y1="145" x2="310" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="145" y1="260" x2="230" y2="330" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="185" y1="448" x2="262" y2="440" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="533" y1="290" x2="568" y2="290" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="533" y1="440" x2="568" y2="440" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><rect x="352" y="70" width="345" height="90" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="524.5" y="87" text-anchor="middle" font-weight="700">MODULES ARE “TOOLS IN THE TOOLKIT”</text><text x="524.5" y="104" text-anchor="middle">Python, Powershell, or any language</text><text x="524.5" y="121" text-anchor="middle">Extend Ansible simplicity to entire stack</text></svg>' },
        { t: 'gallery', items: [{ t: 'img', file: 'assets/img/s008-1.png', alt: 'Pictogramme 1 (slide 9)' }, { t: 'img', file: 'assets/img/s008-2.png', alt: 'Pictogramme 2 (slide 9)' }, { t: 'img', file: 'assets/img/s008-3.png', alt: 'Pictogramme 3 (slide 9)' }, { t: 'img', file: 'assets/img/s008-4.png', alt: 'Pictogramme 4 (slide 9)' }, { t: 'img', file: 'assets/img/s008-5.png', alt: 'Pictogramme 5 (slide 9)' }, { t: 'img', file: 'assets/img/s008-6.png', alt: 'Pictogramme 6 (slide 9)' }, { t: 'img', file: 'assets/img/s008-7.png', alt: 'Pictogramme 7 (slide 9)' }, { t: 'img', file: 'assets/img/s008-8.png', alt: 'Pictogramme 8 (slide 9)' }, { t: 'img', file: 'assets/img/s008-9.png', alt: 'Pictogramme 9 (slide 9)' }, { t: 'img', file: 'assets/img/s008-10.png', alt: 'Pictogramme 10 (slide 9)' }] }
      ] },
    { title: 'ansible-core', src: [10],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 720 520" role="img" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="227" y="150" width="272" height="188" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="363.0" y="167" text-anchor="middle" font-weight="700">ansible-core</text><rect x="118" y="217" width="90" height="70" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="163.0" y="234" text-anchor="middle" font-weight="700">Playbook</text><text x="163.0" y="251" text-anchor="middle">Task</text><text x="163.0" y="268" text-anchor="middle">Task</text><text x="163.0" y="285" text-anchor="middle">Task</text><rect x="243" y="170" width="82" height="54" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="284.0" y="187" text-anchor="middle" font-weight="700">Modules</text><rect x="396" y="156" width="82" height="82" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="437.0" y="173" text-anchor="middle" font-weight="700">Plugins</text><rect x="315" y="273" width="96" height="60" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="363.0" y="290" text-anchor="middle" font-weight="700">Inventory</text><rect x="27" y="226" width="70" height="38" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="62.0" y="243" text-anchor="middle" font-weight="700">Task</text><rect x="571" y="170" width="70" height="30" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="606.0" y="187" text-anchor="middle" font-weight="700">Result</text><rect x="338" y="400" width="70" height="25" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="373.0" y="417" text-anchor="middle" font-weight="700">CMDB</text><rect x="300" y="459" width="130" height="33" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="365.0" y="476" text-anchor="middle" font-weight="700">Servers    Reference</text><text x="52" y="292" text-anchor="middle">Users</text><text x="645" y="163" text-anchor="middle">Hosts</text><text x="640" y="300" text-anchor="middle">Networking</text><line x1="100" y1="250" x2="125" y2="250" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="210" y1="250" x2="240" y2="250" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="500" y1="200" x2="570" y2="200" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="363" y1="400" x2="363" y2="340" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/><line x1="363" y1="459" x2="363" y2="428" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar)"/></svg>' }
      ] },
    { title: 'Command Line', src: [11],
      blocks: [
        { t: 'code', lang: 'console', code: `$ pipx install ansible-core

$ ansible 127.0.0.1, all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
127.0.0.1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}

$ pipx install --include-deps ansible

$ ansible -i <Inventaire> all  -m <module> [-e extra vars] [-a MODULES-ARGS]` }
      ] },
    { title: 'Command Line: playbook', src: [12],
      notes: ['- hosts: 127.0.0.1', 'gather_facts: no', 'connection: local', 'tasks:', '- hosts: all', 'tasks:', '- name: PING', 'ping:', 'register: result', '- name: resultat', 'debug:', 'msg: "{{ result }}"'],
      blocks: [
        { t: 'code', lang: 'console', code: `$ ansible-playbook -i 127.0.0.1, ping.yaml
$ ansible-playbook -i <inventaire> [-l <hosts…>] [-e extravars …] <playbook>

PLAY [127.0.0.1] ***************************************************************
PLAY [all] *********************************************************************
TASK [Gathering Facts] *********************************************************
ok: [127.0.0.1]
TASK [PING] ********************************************************************
ok: [127.0.0.1]
TASK [resultat] ****************************************************************
ok: [127.0.0.1] => {
    "msg": {
        "changed": false,
        "failed": false,
        "ping": "pong"
    }
}
PLAY RECAP *********************************************************************
127.0.0.1                  : ok=3    changed=0    unreachable=0    failed=0` }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Pourquoi dit-on qu\'Ansible est « agentless » ?',
        options: ['Il se connecte avec OpenSSH, WinRM ou PSRP, sans agent à installer ni à mettre à jour', 'Il installe un agent léger sur chaque hôte au premier lancement', 'Il impose un agent uniquement sur les hôtes Windows'], answer: 0,
        explain: 'La slide 6 indique « Agentless architecture », « Uses OpenSSH, WinRM & PSRP » et « No agents to exploit or update ».', ref: [6] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Dans quel(s) langage(s) un module Ansible peut-il être écrit, selon la slide 9 ?',
        options: ['En Python uniquement', 'En Python, PowerShell ou tout autre langage', 'En YAML uniquement'], answer: 1,
        explain: 'La slide 9 présente les modules comme des « outils de la boîte à outils » : « Python, Powershell, or any language ».', ref: [9] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle commande exécute un playbook sur un inventaire donné ?',
        options: ['ansible-playbook -i &lt;inventaire&gt; &lt;playbook&gt;', 'ansible -i &lt;inventaire&gt; &lt;playbook&gt;', 'pipx install ansible-core -i &lt;inventaire&gt;'], answer: 0,
        explain: 'La slide 12 donne <code>ansible-playbook -i &lt;inventaire&gt;</code> suivi des options et du playbook (cf. slide 12).', ref: [12] }
    ] }
  ],
  takeaways: [
    { html: 'Ansible combine un langage d\'automatisation, qui décrit l\'infrastructure dans des playbooks, et un moteur qui les exécute.', ref: [4] },
    { html: 'Ansible automation controller (Red Hat Ansible Automation Platform) et son projet amont AWX sont des frameworks pour contrôler, sécuriser et gérer l\'automatisation Ansible avec une interface et une API REST.', ref: [4] },
    { html: 'Ansible est sans agent : il utilise OpenSSH, WinRM et PSRP, donc il n\'y a aucun agent à exploiter ou à mettre à jour.', ref: [6] },
    { html: 'Les tâches d\'un playbook sont exécutées séquentiellement et invoquent des modules ; l\'idempotence fait partie des principes présentés.', ref: [7] },
    { html: 'Les modules sont les « outils de la boîte à outils » : ils peuvent être écrits en Python, PowerShell ou tout autre langage.', ref: [9] },
    { html: 'L\'inventaire décrit l\'organisation des serveurs et des objets et peut être extrait dynamiquement, par exemple depuis AWS EC2, Azure, GCP ou VMware.', ref: [8] }
  ]
});
