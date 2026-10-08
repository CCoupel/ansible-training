/* Module 03 — Playbooks (slides PPTX 30 à 43). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm03', num: 3, emoji: '📜',
  title: 'Playbooks',
  tagline: 'Lire et comprendre un playbook : plays, tâches, modules, blocs, import et include.',
  objectives: [
    { html: 'Décrire un playbook : un fichier YAML simple et lisible qui définit une série de tâches à exécuter.', ref: [31] },
    { html: 'Identifier les éléments d\'un playbook : plays, hôtes de l\'inventaire, tâches, modules et paramètres.', ref: [32] },
    { html: 'Lire un playbook qui installe et démarre Apache (<code>hosts</code>, <code>vars</code>, <code>remote_user</code>, <code>tasks</code>).', ref: [34] },
    { html: 'Grouper des tâches avec <code>block</code> et conditionner une tâche avec <code>when</code>.', ref: [41, 42] },
    { html: 'Distinguer les <code>import*</code> (statiques) des <code>include*</code> (dynamiques).', ref: [43] }
  ],
  slides: [
    { title: 'Playbook', src: [30],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_reuse.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_reuse.html</a>' }
      ] },
    { title: 'What is an Ansible Playbook?', src: [31],
      blocks: [
        { t: 'bullets', items: ['Ansible Playbooks are the cornerstone of Ansible’s automation capabilities.', 'Written in YAML', 'simple, human-readable files', 'define a series of tasks to be executed.'] },
        { t: 'text', html: '<b>They allow you to:</b>' },
        { t: 'bullets', items: ['Automate repetitive tasks: Simplify complex processes by automating them.', 'Ensure consistency: Apply the same configuration across multiple systems.', 'Orchestrate workflows: Coordinate tasks across different servers and environments.'] },
        { t: 'text', html: '<b>Key Features:</b>' },
        { t: 'bullets', items: ['Declarative Syntax: Playbooks describe the desired state of your systems.', 'Modular Structure: Tasks are organized into plays, each targeting specific hosts.', 'Idempotency: Ensures that applying the same playbook multiple times will not change the system after the first application.'] }
      ] },
    { title: 'What are Playbook:', src: [32],
      blocks: [
        { t: 'bullets', items: ['List of Plays:<ul><li>List of hosts based on inventory</li><li>List of tasks</li><li>List of modules</li><li>Parameters of Modules</li></ul>'] },
        { t: 'text', html: '<b>Why:</b>' },
        { t: 'bullets', items: ['Reusable', 'Idempotency'] },
        { t: 'text', html: '<b>How:</b>' },
        { t: 'bullets', items: ['Splits in Simple Goals', 'Basics actions', 'Subsequent Playbooks/Roles'] }
      ] },
    { title: 'Exemple:', src: [33],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Deploy-APP:
  - deploy_apache.yml
  - configure_apache.yml
  - compile-APP.yml
  - deploy-APP.yml` }
      ] },
    { title: 'Playbook example', src: [34, 35, 36, 37, 38, 39],
      notes: ['Task names (slide 35): The name fields are human-readable comments. Optional, but useful as comments to the playbook. These strings also show up in automation controller / AWX, so it is easy to correlate any failures in a long running playbook.', 'Inventory (slide 36): Inventory call-out', 'Variables (slide 37): Variables can be handled in several different ways:', 'Directly in the playbook', 'As part of a separate vars file', 'Via the command line', 'As output from a previous play', 'Via automation controller / AWX', 'Remote user (slide 38): You are not required to use root as the remote user. You can have Ansible connect and run the playbook as any user or even multiple users – as long as that user has the permission to perform the tasks in the playbook. You can even use multiple users and specify different users for different plays or tasks.', 'Ansible supports sudo, su, powerbroker, and other privilege escalation mechanisms.'],
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
  - name: start httpd
    ansible.builtin.service:
      name: httpd
      state: started` }
      ] },
    { title: 'Results', src: [40],
      blocks: [
        { t: 'code', lang: 'console', code: `$ ansible-playbook -i hosts deploy_DB2.yml -vv
Using /etc/ansible/ansible.cfg as config file
statically imported: /home/user/project/roles/DB2/tasks/00-PreRequisit.yml

PLAYBOOK: deploy_DB2.yml *******************************************************
1 plays in deploy_DB2.yml

PLAY [DB2] *********************************************************************

TASK [Gathering Facts] *********************************************************
ok: [SRV-1]

TASK [DB2 : set LANG] **********************************************************
task path: /home/user/project/roles/DB2/tasks/00-PreRequisit.yml:68
ok: [SRV-1] => (item={'key': 'LANG', 'value': 'fr_FR@euro'}) => {"ansible_loop_var": "item", "backup": "", "changed": false, "item": {"key": "LANG", "value": "fr_FR@euro"}, "msg": ""}
ok: [SRV-1] => (item={'key': 'LC_ALL', 'value': 'fr_FR@euro'}) => {"ansible_loop_var": "item", "backup": "", "changed": false, "item": {"key": "LC_ALL", "value": "fr_FR@euro"}, "msg": ""}

TASK [DB2 : set etc/profile] ***************************************************
task path: /home/user/project/roles/DB2/tasks/00-PreRequisit.yml:74
ok: [SRV-1] => {"backup": "", "changed": false, "msg": ""}

TASK [DB2 : setting kernel] ****************************************************
task path: /home/user/project/roles/DB2/tasks/00-PreRequisit.yml:77
changed: [SRV-1] => (item={'key': 'kernel.shmmni', 'value': '16384'}) => {"ansible_loop_var": "item", "backup": "", "changed": true, "item": {"key": "kernel.shmmni", "value": "16384"}, "msg": "line added"}
changed: [SRV-1] => (item={'key': 'kernel.shmmax', 'value': '68719476736'}) => {"ansible_loop_var": "item", "backup": "", "changed": true, "item": {"key": "kernel.shmmax", "value": "68719476736"}, "msg": "line added"}

PLAY RECAP *********************************************************************
SRV-1                      : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0` }
      ] },
    { title: 'PLAYBOOK: Tasks', src: [41],
      blocks: [
        { t: 'text', html: '<b>Tasks:</b>' },
        { t: 'code', lang: 'yaml', code: `- name: tache 1
  ansible.builtin.debug:
    msg: "tache 1"
  when: not last_result
- name: tache 2
  ansible.builtin.debug:
    msg: "tache 2"
  when: not last_result` }
      ] },
    { title: 'PLAYBOOK: Group of Tasks', src: [42],
      blocks: [
        { t: 'text', html: '<b>Group of Tasks:</b>' },
        { t: 'code', lang: 'yaml', code: `- name: groupe de taches
  block:
  - name: tache 1
    ansible.builtin.debug:
      msg: "tache 1"
  - name: tache 2
    ansible.builtin.debug:
      msg: "tache 2"
  when: not last_result` }
      ] },
    { title: 'PLAYBOOK EXAMPLE', src: [43],
      notes: ['Exemple import / include', 'Import: playbook', 'Include: role et tache'],
      blocks: [
        { t: 'text', html: '<b>Import =&gt; static</b>' },
        { t: 'bullets', items: ['All import* statements are pre-processed at the time playbooks are parsed.', 'loops cannot be used with imports at all.'] },
        { t: 'text', html: '<b>Include =&gt; dynamic</b>' },
        { t: 'bullets', items: ['All include* statements are processed as they encountered during the execution of the playbook.', 'loop can be used with an include,', 'the included tasks or role will be executed once for each item in the loop.', 'Tags which only exist inside a dynamic include will not show up in --list-tags output.', 'Tasks which only exist inside a dynamic include will not show up in --list-tasks output.', 'Trigger is only in the dynamic include itself.', 'You cannot use --start-at-task to begin execution at a task inside a dynamic include.'] }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'À quoi sert le champ <code>name</code> d\'une tâche ?',
        options: ['Il est obligatoire et identifie le module appelé', 'Il définit l\'hôte cible de la tâche', 'Il documente la tâche et apparaît dans AWX'], answer: 2,
        explain: 'Les notes de la slide 35 : les champs <code>name</code> sont des commentaires lisibles, facultatifs mais utiles ; ces textes apparaissent aussi dans automation controller / AWX.', ref: [35] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle affirmation sur les <code>include*</code> est exacte ?',
        options: ['Leurs tâches apparaissent toujours dans la sortie de --list-tasks', 'Ils sont traités pendant l\'exécution du playbook et acceptent une boucle', 'Ils sont pré-traités au moment où le playbook est analysé'], answer: 1,
        explain: 'Slide 43 : « Include => dynamic » ; une boucle peut être utilisée avec un include, alors que les tâches d\'un include dynamique n\'apparaissent pas dans la sortie de <code>--list-tasks</code>.', ref: [43] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que garantit l\'idempotence d\'un playbook ?',
        options: ['Rejouer le playbook ne change plus le système après la première application', 'Le playbook s\'exécute plus vite à chaque nouveau lancement sur le même hôte', 'Les tâches du playbook s\'exécutent en parallèle sur tous les hôtes à la fois'], answer: 0,
        explain: 'Slide 31 : « Idempotency: Ensures that applying the same playbook multiple times will not change the system after the first application ».', ref: [31] }
    ] }
  ],
  takeaways: [
    { html: 'Un playbook est écrit en YAML : ce sont des fichiers simples et lisibles qui définissent une série de tâches à exécuter.', ref: [31] },
    { html: 'Un playbook est une liste de plays ; chaque play cible des hôtes de l\'inventaire et liste des tâches, des modules et leurs paramètres.', ref: [32] },
    { html: 'Les playbooks ont une syntaxe déclarative, une structure modulaire et sont idempotents : les appliquer plusieurs fois ne change pas le système après la première application.', ref: [31] },
    { html: 'Le champ <code>name</code> est facultatif mais utile comme commentaire ; il apparaît aussi dans automation controller / AWX.', ref: [35] },
    { html: '<code>block</code> regroupe des tâches ; <code>when</code> conditionne l\'exécution d\'une tâche.', ref: [41, 42] },
    { html: 'Les <code>import*</code> sont traités au chargement du playbook (statique) ; les <code>include*</code> pendant son exécution (dynamique).', ref: [43] }
  ]
});
