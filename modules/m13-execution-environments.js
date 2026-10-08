/* Module 13 — Execution Environments (slides PPTX 183 à 192). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm13', num: 13, emoji: '🐳',
  title: 'Execution Environments',
  tagline: 'Exécuter Ansible dans une image conteneur : la construire avec ansible-builder et la lancer avec ansible-navigator.',
  objectives: [
    { html: 'Définir un Execution Environment (EE) : une image conteneur qui joue le rôle de nœud de contrôle Ansible.', ref: [184] },
    { html: 'Citer les couches d\'un EE : image de base, <code>ansible-core</code>, <code>ansible-runner</code>, collections, dépendances Python et dépendances système.', ref: [185] },
    { html: 'Écrire une définition <code>execution-environment.yml</code> en <code>version: 3</code> et construire l\'image avec <code>ansible-builder</code>.', ref: [186, 187] },
    { html: 'Lancer un playbook dans un EE avec <code>ansible-navigator</code>, en mode <code>interactive</code> ou <code>stdout</code>.', ref: [188, 189] },
    { html: 'Citer le contenu d\'<code>ansible-dev-tools</code> et créer un squelette avec <code>ansible-creator</code>.', ref: [190] }
  ],
  slides: [
    { title: 'Execution Environments', src: [183],
      blocks: [
        { t: 'text', html: 'Run Ansible in a container image: the Execution Environment (EE)' },
        { t: 'text', html: 'ansible-builder builds it, ansible-navigator runs it' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/getting_started_ee/index.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/getting_started_ee/index.html</a>' }
      ] },
    { title: 'Why Execution Environments?', src: [184],
      blocks: [
        { t: 'bullets', items: [
          'The problem: "it works on my machine"<ul><li>Python, ansible-core and collection versions differ from one control node to another</li><li>Dependencies pile up on the control node and conflict</li></ul>',
          'The solution: an Execution Environment (EE)<ul><li>A container image that acts as the Ansible control node</li><li>Contains ansible-core, ansible-runner, Python, collections and their dependencies</li></ul>',
          'The same runtime everywhere<ul><li>On a laptop, in CI, and in AWX / automation controller</li><li>One versioned artifact: build once, run anywhere a container engine runs</li></ul>'
        ] }
      ] },
    { title: 'Anatomy of an EE', src: [185],
      blocks: [
        { t: 'layers', items: [
          { name: 'System dependencies (bindep)' },
          { name: 'Python dependencies' },
          { name: 'Collections' },
          { name: 'ansible-runner' },
          { name: 'ansible-core' },
          { name: 'Base image', base: true }
        ] },
        { t: 'bullets', items: [
          'Built layer by layer<ul><li>Bottom: a base image</li><li>Top: what your content needs</li></ul>',
          'Community images exist<ul><li>GitHub Container Registry: ansible-community/community-ee-minimal</li></ul>'
        ] }
      ] },
    { title: 'ansible-builder: execution-environment.yml', src: [186],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
version: 3

images:
  base_image:
    name: docker.io/redhat/ubi9:latest

dependencies:
  ansible_core:
    package_pip: ansible-core~=2.20.0
  ansible_runner:
    package_pip: ansible-runner
  python_interpreter:
    package_system: python3.12
    python_path: /usr/bin/python3.12
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt` },
        { t: 'bullets', items: [
          'version: 3 needs Ansible Builder 3.x',
          'Pin a recent Python and ansible-core<ul><li>ansible-core 2.20 needs Python 3.12 or later</li><li>python_interpreter installs it in the image</li></ul>',
          'Referenced files<ul><li>requirements.yml, requirements.txt and bindep.txt are expected next to this file</li></ul>',
          'Also available: additional_build_steps'
        ] }
      ] },
    { title: 'ansible-builder: build', src: [187],
      blocks: [
        { t: 'code', lang: 'console', code: `$ pip install ansible-builder

$ ansible-builder build --tag=my_ee:1.0 --file=execution-environment.yml

# Build context only, no image
$ ansible-builder create` },
        { t: 'bullets', items: [
          'build: reads the definition, creates the build context and builds the image',
          'create: writes the build instructions and context without building',
          'Podman is the default container runtime<ul><li>Use --container-runtime=docker for Docker</li></ul>',
          'Without --file, execution-environment.yml is used'
        ] }
      ] },
    { title: 'ansible-navigator', src: [188],
      blocks: [
        { t: 'text', html: 'A text-based user interface (TUI) to run and explore Ansible content' },
        { t: 'bullets', items: [
          'Subcommands<ul><li>run: run a playbook</li><li>replay: explore a previous run from its artifact</li><li>images: explore EE images</li><li>exec: run a command inside an EE</li><li>also: collections, doc, inventory, config, settings, lint, builder, welcome</li></ul>',
          'Two modes<ul><li>interactive (default): browse results, then drill down</li><li>stdout: classic output, like ansible-playbook</li></ul>',
          'Settings in ansible-navigator.yml'
        ] }
      ] },
    { title: 'ansible-navigator: run a playbook', src: [189],
      blocks: [
        { t: 'code', lang: 'console', code: `$ ansible-navigator run site.yml -i inventory.yml \\
    --eei my_ee:1.0 --mode stdout --pull-policy never` },
        { t: 'code', lang: 'yaml', code: `# ansible-navigator.yml
---
ansible-navigator:
  execution-environment:
    image: my_ee:1.0
    pull:
      policy: never
  mode: stdout
  playbook-artifact:
    enable: true` },
        { t: 'bullets', items: [
          '--eei: EE image',
          '--pull-policy never: use the local image, do not download it<ul><li>The EE was built locally</li></ul>',
          'A playbook artifact is saved for each run'
        ] },
        { t: 'text', html: '<code>ansible-navigator replay &lt;artifact&gt;.json</code>' }
      ] },
    { title: 'ansible-dev-tools & ansible-creator', src: [190],
      blocks: [
        { t: 'bullets', items: [
          'ansible-dev-tools: one package<ul><li>ansible-builder, ansible-core, ansible-creator</li><li>ansible-dev-environment, ansible-lint</li><li>ansible-navigator, ansible-sign, molecule</li><li>pytest-ansible, tox-ansible</li></ul>',
          'ansible-creator: scaffold content<ul><li>init collection</li><li>init playbook</li></ul>',
          'Arguments may vary between versions: check ansible-creator init --help',
          'Container image<ul><li>GitHub Container Registry: ansible/community-ansible-dev-tools</li></ul>'
        ] },
        { t: 'code', lang: 'console', code: `$ pip install ansible-dev-tools
$ adt --version

$ ansible-creator init collection my_namespace.my_collection ./collections/ansible_collections
$ ansible-creator init playbook my_namespace.my_project ./my_project` }
      ] },
    { title: 'Exercise: build and use an EE', src: [191, 192],
      blocks: [
        { t: 'lab', title: 'Build an EE and run a playbook in it',
          steps: [
            'Write an execution-environment.yml (version 3) with a recent Python, ansible-core 2.20 and the collection community.general',
            'Build the image my_ee:1.0 with ansible-builder',
            'List it with ansible-navigator images',
            'Show the ansible-core version inside the EE: ansible-navigator exec --eei my_ee:1.0 -- ansible --version',
            'Run a playbook that calls ansible.builtin.ping on localhost inside the EE',
            'Prerequisite: Podman or Docker installed'
          ] },
        { t: 'reveal', label: 'Exercise: solution', html: '<pre># execution-environment.yml\n---\nversion: 3\n\nimages:\n  base_image:\n    name: docker.io/redhat/ubi9:latest\n\ndependencies:\n  ansible_core:\n    package_pip: ansible-core~=2.20.0\n  ansible_runner:\n    package_pip: ansible-runner\n  python_interpreter:\n    package_system: python3.12\n    python_path: /usr/bin/python3.12\n  galaxy:\n    collections:\n      - name: community.general\n# ping.yml\n---\n- name: Ping localhost from the EE\n  hosts: localhost\n  gather_facts: false\n  tasks:\n    - name: Check the connection\n      ansible.builtin.ping:\n\n$ ansible-builder build --tag=my_ee:1.0\n$ ansible-navigator images\n$ ansible-navigator run ping.yml \\\n    --eei my_ee:1.0 --pull-policy never \\\n    --mode stdout\n$ ansible-navigator exec --eei my_ee:1.0 \\\n    -- ansible --version</pre>' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle version minimale de Python demande <code>ansible-core</code> 2.20, d\'après la slide 186 ?',
        options: ['Python 3.6 ou plus', 'Python 3.9 ou plus', 'Python 3.12 ou plus'], answer: 2,
        explain: 'Slide 186 : « ansible-core 2.20 needs Python 3.12 or later » ; <code>python_interpreter</code> l\'installe dans l\'image.', ref: [186] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle commande écrit les instructions et le contexte de build sans construire l\'image ?',
        options: ['ansible-builder create', 'ansible-builder build', 'ansible-navigator images'], answer: 0,
        explain: 'Slide 187 : « create: writes the build instructions and context without building » ; <code>build</code> construit aussi l\'image.', ref: [187] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Quel mode d\'<code>ansible-navigator</code> affiche une sortie classique, comme <code>ansible-playbook</code> ?',
        options: ['interactive', 'replay', 'stdout'], answer: 2,
        explain: 'Slide 188 : « stdout: classic output, like ansible-playbook » ; <code>interactive</code> est le mode par défaut.', ref: [188] }
    ] }
  ],
  takeaways: [
    { html: 'Un Execution Environment est une image conteneur qui joue le rôle de nœud de contrôle Ansible : <code>ansible-core</code>, <code>ansible-runner</code>, Python, collections et leurs dépendances.', ref: [184] },
    { html: 'Le même EE s\'exécute à l\'identique sur un poste, en CI et dans AWX / automation controller : on le construit une fois, on l\'exécute partout où tourne un moteur de conteneurs.', ref: [184] },
    { html: 'Dans <code>execution-environment.yml</code>, <code>version: 3</code> demande Ansible Builder 3.x ; <code>ansible-core</code> 2.20 demande Python 3.12 ou plus, installé par <code>python_interpreter</code>.', ref: [186] },
    { html: '<code>ansible-builder build</code> crée le contexte et construit l\'image, <code>create</code> écrit seulement le contexte ; Podman est le moteur par défaut, <code>--container-runtime=docker</code> sélectionne Docker.', ref: [187] },
    { html: '<code>ansible-navigator run</code> lance un playbook dans un EE avec <code>--eei</code> ; le mode <code>interactive</code> est le défaut, <code>stdout</code> donne la sortie classique.', ref: [188, 189] },
    { html: '<code>ansible-dev-tools</code> regroupe les outils (builder, navigator, creator, lint…) dans un seul paquet : <code>pip install ansible-dev-tools</code>.', ref: [190] }
  ]
});
