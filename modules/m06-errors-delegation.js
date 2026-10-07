/* Module 06 — Errors & delegation (slides PPTX 68 à 81). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm06', num: 6, emoji: '🚨',
  title: 'Errors & delegation',
  tagline: 'Gérer les erreurs d\'un playbook, déléguer des tâches et changer d\'utilisateur.',
  objectives: [
    { html: 'Expliquer la gestion des erreurs dans Ansible : réagir aux échecs pour obtenir des automatisations résilientes.', ref: [69] },
    { html: 'Utiliser <code>ignore_errors</code>, <code>failed_when</code> et <code>changed_when</code> pour contrôler le résultat d\'une tâche.', ref: [69, 71, 72, 73] },
    { html: 'Structurer des tâches avec <code>block</code>, <code>rescue</code> et <code>always</code>.', ref: [74] },
    { html: 'Déléguer une tâche à un autre hôte avec <code>delegate_to</code> ou <code>local_action</code>.', ref: [78, 79] },
    { html: 'Exécuter une tâche sous un autre utilisateur avec <code>become</code>, <code>become_user</code> et <code>become_method</code>.', ref: [79] }
  ],
  slides: [
    { title: 'errors', src: [68],
      blocks: [
        { t: 'text', html: 'Error handling' }
      ] },
    { title: 'Error handling: concepts', src: [69],
      blocks: [
        { t: 'bullets', items: ['Definition: Error handling in Ansible involves managing and responding to errors that occur during the execution of playbooks.', 'Purpose: It ensures that your automation scripts can gracefully handle failures, providing resilience and reliability.', 'Key Concepts:<ul><li>ignore_errors: Allows tasks to continue even if they fail.</li><li>failed_when: Custom conditions to define when a task should be considered failed.</li><li>rescue: A block to execute tasks if an error occurs.</li><li>always: A block to execute tasks regardless of success or failure.</li></ul>', 'Usage Examples:<ul><li>Ignoring Errors: ignore_errors: yes</li></ul>'] }
      ] },
    { title: 'errors: module result', src: [70],
      blocks: [
        { t: 'code', lang: 'yaml', code: `What my module return:
- name: Do Someyhing
  Command: test_command -x -y -z
  Register: result` }
      ] },
    { title: 'errors: ignoring errors', src: [71],
      blocks: [
        { t: 'code', lang: 'yaml', code: `errors
Ignoring errors:
- name: ping host
  Command: ping -c1 www.google.com
  Register: result
	  ignore_errors: yes`, caption: 'http://www.google.com' }
      ] },
    { title: 'errors: define error reason', src: [72],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Define error reason:
- name: ping host
  ansible.builtin.command: test_command -x -y -z
  register: result
  failed_when: "'FAILED' in result.stdout"` }
      ] },
    { title: 'errors: define changed reason', src: [73],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Define changed reason:
- name: ping host
  ansible.builtin.command: test_command -x -y -z
  register: result
  changed_when: "'FAILED' in result.stdout"` }
      ] },
    { title: 'errors: blocks', src: [74],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Blocks:

tasks:
  - name: my block
    block:
    - ansible.builtin.debug:
        msg: "start block execution"
    - ansible.builtin.command: test_command2 -x -y -z
    - ansible.builtin.command: test_command3 -x -y -z
    rescue:
    - ansible.builtin.debug:
        msg: "an error occurs"
    - ansible.builtin.command: error_command
    always:
    - ansible.builtin.debug:
        msg: "always execution block"
    - ansible.builtin.command: always_command` }
      ] },
    { title: 'Exercice: proxy', src: [75, 76],
      blocks: [
        { t: 'text', html: '<small>Filtres</small>' },
        { t: 'lab', title: 'À réaliser', steps: ['- Write a playbook :', '- check connectivity by accessing URL without proxy', '- if failed,<br>- check connectivity by accessing URL with proxy<br>- define global_proxy fact when not failed'] },
        { t: 'bullets', items: ['Test: https://gitlab.com', 'Proxy: http://proxy.example.com:8080'] },
        { t: 'reveal', label: 'Voir la solution (slide 76)', html: '<pre>- name: Check connectivity and define proxy\n  hosts: all\n  tasks:\n    - block:\n        - name: Check connectivity without proxy\n          uri:\n            url: https://gitlab.com\n            use_proxy: no\n            return_content: no\n      rescue:\n        - name: Check connectivity with proxy(deuxième tentative)\n          uri:\n            url: https://gitlab.com\n            use_proxy: yes\n            return_content: no\n          environment:\n            https_proxy:  "http://proxy.example.com:8080"\n        - name: define global proxy\n          set_fact:\n            global_proxy: "http://proxy.example.com:8080"</pre>' }
      ] },
    { title: 'Delegation', src: [77],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_privilege_escalation.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_privilege_escalation.html</a>' }
      ] },
    { title: 'Delegation: concepts', src: [78],
      blocks: [
        { t: 'bullets', items: ['Definition: allow to execute tasks on a different host than the one specified', 'Purpose: help in managing tasks that need to be performed on a control node or a different host, ensuring efficient and precise management of inter-related environments.', 'Key Concepts:<ul><li>delegate_to: used to specify the host on which a task should be executed.</li><li>local_action: A shorthand syntax for delegating tasks to the local machine.</li></ul>', 'Usage Examples:<ul><li>Load Balancer Management: Add/Remove web servers from a load-balanced pool.</li><li>File Synchronization: Using RSYNC to copy files from the management server to target servers.</li></ul>', 'Benefits: enhance flexibility, allowing for complex orchestration and better control over task execution.'] }
      ] },
    { title: 'Execute task on other host than the inventory one:', src: [79],
      blocks: [
        { t: 'text', html: 'local_action : module to execute an other module locally' },
        { t: 'text', html: '<b>delegate_to : host</b>' },
        { t: 'bullets', items: ['The task will be executed ont the server ‘host’ instead of the current one'] },
        { t: 'text', html: '<b>delegated_facts : true/false</b>' },
        { t: 'bullets', items: ['The facts are the one of the delegated server instead of the current one'] },
        { t: 'text', html: 'Execute task from a different user:' },
        { t: 'text', html: '<b>become</b>' },
        { t: 'bullets', items: ['set to yes to activate privilege escalation.'] },
        { t: 'text', html: '<b>become_user</b>' },
        { t: 'bullets', items: ['set to user with desired privileges — the user you become,'] },
        { t: 'text', html: '<b>become_method</b>' },
        { t: 'bullets', items: ['overrides the default method to set to sudo/su/pbrun/pfexec/doas/dzdo/ksu/runas'] },
        { t: 'text', html: '<b>become_flags</b>' },
        { t: 'bullets', items: ['permit the use of specific flags for the tasks or role.'] },
        { t: 'text', html: 'One common use is to change the user to nobody when the shell is set to no login' }
      ] },
    { title: 'Exercice: delegation', src: [80, 81],
      blocks: [
        { t: 'lab', title: 'À réaliser', steps: ['- ping inventory hosts', '- add hostname in /tmp/hosts of the controller'] },
        { t: 'reveal', label: 'Voir la solution (slide 81)', html: '<pre>---\n- hosts: all\n  gather_facts: no\n  tasks:\n    - name: Ping inventory hosts\n      ping:\n      #register: myping\n    - name: Add hostname to /tmp/hosts on the controller\n      local_action:\n        module: lineinfile\n        path: /tmp/hosts\n        line: "{{ inventory_hostname }}"\n      #when: myping.ok is useless\n      #delegate_to: localhost\n      #connection: local</pre>' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quel mot-clé exécute un bloc de tâches quel que soit le succès ou l\'échec du bloc principal ?',
        options: ['rescue', 'ignore_errors', 'always'], answer: 2,
        explain: 'Slide 69 : « always: A block to execute tasks regardless of success or failure » ; <code>rescue</code> ne s\'exécute que si une erreur survient.', ref: [69] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Que fait <code>delegate_to</code> ?',
        options: ['Il charge les facts d\'un autre inventaire', 'Il exécute la tâche sur l\'hôte indiqué à la place de l\'hôte courant', 'Il délègue l\'exécution du playbook à un autre utilisateur'], answer: 1,
        explain: 'Slide 79 : « The task will be executed ont the server ‘host’ instead of the current one ».', ref: [79] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Comment considérer une tâche comme échouée d\'après sa sortie ?',
        options: ['Avec failed_when et une condition sur le résultat enregistré', 'Avec changed_when', 'Avec become'], answer: 0,
        explain: 'Slide 72 : <code>failed_when</code> teste le contenu de <code>result.stdout</code> pour décider de l\'échec.', ref: [72] }
    ] }
  ],
  takeaways: [
    { html: '<code>ignore_errors</code> permet aux tâches de continuer même si elles échouent ; <code>failed_when</code> définit une condition personnalisée d\'échec.', ref: [69] },
    { html: '<code>changed_when</code> définit à quelle condition une tâche est considérée comme modifiée.', ref: [73] },
    { html: '<code>rescue</code> exécute des tâches si une erreur survient dans le bloc, <code>always</code> les exécute dans tous les cas.', ref: [69, 74] },
    { html: '<code>delegate_to</code> exécute une tâche sur un autre hôte ; <code>local_action</code> est une syntaxe abrégée pour la machine locale.', ref: [78] },
    { html: '<code>delegated_facts</code> indique si les facts utilisés sont ceux du serveur délégué plutôt que ceux de l\'hôte courant.', ref: [79] },
    { html: '<code>become</code> active l\'élévation de privilèges ; <code>become_user</code> choisit l\'utilisateur et <code>become_method</code> la méthode (sudo, su, pbrun…).', ref: [79] }
  ]
});
