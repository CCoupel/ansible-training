/* Module 10 — Vault (slides PPTX 135 à 141). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm10', num: 10, emoji: '🔒',
  title: 'Vault',
  tagline: 'Chiffrer les données sensibles avec Ansible Vault.',
  tagline_en: 'Encrypt sensitive data with Ansible Vault.',
  objectives: [
    { html: 'Définir Ansible Vault : stocker et gérer en sécurité des données sensibles (mots de passe, clés, secrets).', html_en: 'Define Ansible Vault: store and manage sensitive data (passwords, keys, secrets) securely.', ref: [136] },
    { html: 'Chiffrer et modifier un fichier avec <code>ansible-vault create</code>, <code>edit</code> et <code>encrypt</code>.', html_en: 'Encrypt and edit a file with <code>ansible-vault create</code>, <code>edit</code> and <code>encrypt</code>.', ref: [138] },
    { html: 'Chiffrer une valeur avec <code>encrypt_string</code> pour la placer dans une variable.', html_en: 'Encrypt a value with <code>encrypt_string</code> to place it in a variable.', ref: [139] },
    { html: 'Fournir le mot de passe du vault avec <code>--ask-vault-pass</code> ou <code>--vault-password-file</code>.', html_en: 'Provide the vault password with <code>--ask-vault-pass</code> or <code>--vault-password-file</code>.', ref: [139] },
    { html: 'Chiffrer <code>ansible_user</code> et <code>ansible_password</code> dans un inventaire.', html_en: 'Encrypt <code>ansible_user</code> and <code>ansible_password</code> in an inventory.', ref: [140, 141] }
  ],
  slides: [
    { title: 'Vault', src: [135],
      blocks: [
        { t: 'code', lang: 'yaml', code: `Vault:
https://docs.ansible.com/projects/ansible/latest/vault_guide/index.html` }
      ] },
    { title: 'What is Ansible Vault?', src: [136],
      blocks: [
        { t: 'bullets', items: ['Ansible Vault is a feature within Ansible that allows you to securely store and manage sensitive data such as passwords, keys, and other secrets.', 'Purpose of Ansible Vault:<ul><li>It enables encryption of variables, files, and entire playbooks to protect sensitive information from unauthorized access.</li></ul>', 'Key Features:<ul><li>Encryption and Decryption: Encrypt and decrypt files and variables using a password or key.</li><li>Integration: Seamlessly integrate encrypted data into your playbooks and roles.</li><li>Flexibility: Encrypt entire files or specific variables within a file.</li><li>Access Control: Control who can access and modify the encrypted data.</li></ul>', 'Why Use Ansible Vault?<ul><li>Security: Protect sensitive information within your automation scripts and playbooks.</li><li>Compliance: Ensure compliance with security policies by encrypting sensitive data.</li><li>Ease of Use: Easily integrate encrypted data into your existing Ansible workflows without significant changes.</li></ul>'] }
      ] },
    { title: 'VAULT', src: [137],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- store secured values in a crypted file

- encrypt the secured value` }
      ] },
    { title: 'VAUL file', src: [138],
      blocks: [
        { t: 'text', html: 'Store in a sidekick encrypted file:' },
        { t: 'code', lang: 'console', code: `$ ansible-vault create --vault-id test1@prompt vault1
$ ansible-vault edit --vault-id test1@prompt vault1
$ ansible-vault encrypt --vault-id test2@prompt inventaire` }
      ] },
    { title: 'VAULT vars', src: [139],
      blocks: [
        { t: 'code', lang: 'console', code: `Store encrypted var in any var storage place:

$ ansible-vault encrypt_string --vault-id test1@prompt \\
'mon_password_secret' --name 'password'

password: !vault |
      $ANSIBLE_VAULT;1.2;AES256;test1
      62313365396662343061393464336163383764373764613633653634306231386433626436623361
      6134333665353966363534333632666535333761666131620a663537646436643839616531643561
      63396265333966386166373632626539326166353965363262633030333630313338646335303630
      3438626666666137650a353638643435666633633964366338633066623234616432373231333331
      6564



ansible-playbook --ask-vault-pass --vault-id test1 -i inventory.yml my_playbook.yml

ansible-playbook --vault-password-file /tmp/my_file.sh --vault-id test1 -i inventory.yml my_playbook.yml` }
      ] },
    { title: 'Exercice: Vault inventory', src: [140, 141],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['Create inventory file with :<br>- user and password connection encrypted<br>(ansible_user, ansible_password)'] },
        { t: 'code', lang: 'console', code: `ansible-playbook --ask-vault-pass --vault-id test1 -i inventory.yml my_playbook.yml` },
        { t: 'text', html: '<b>Ini:</b>' },
        { t: 'code', lang: 'ini', code: `[group:var]
Ansible_user=!vault ……` },
        { t: 'text', html: '<b>Yaml:</b>' },
        { t: 'code', lang: 'yaml', code: `All:
  hosts:
    …..
  vars:
    ansible_user: !vault…..` },
        { t: 'reveal', slide: 141, html: '<pre>ansible-vault encrypt_string \'myuser\' --name \'ansible_user\' --vault-id user_key@prompt\nansible-vault encrypt_string \'mypassword\' --name \'ansible_password\' --vault-id pass_key@prompt\nall:\n  hosts:\n    server1:\n      ansible_host: 192.168.1.10\n      ansible_user: !vault |\n        $ANSIBLE_VAULT;1.1;AES256;user_key\n        62313365396662343061393464336163383764373764613633653634306231386433626436623361\n        6134333665353966363534333632666535333761666131620a663537646436643839616531643561\n        63396265333966386166373632626539326166353965363262633030333630313338646335303630\n        3438626666666137650a353638643435666633633964366338633066623234616432373231333331\n        6564\n      ansible_password: !vault |\n        $ANSIBLE_VAULT;1.1;AES256;pass_key\n        62313365396662343061393464336163383764373764613633653634306231386433626436623361\n        6134333665353966363534333632666535333761666131620a663537646436643839616531643561\n        63396265333966386166373632626539326166353965363262633030333630313338646335303630\n        3438626666666137650a353638643435666633633964366338633066623234616432373231333331\n        6564\n    server2:\n      ansible_host: 192.168.1.11\n      ansible_user: !vault |\n        $ANSIBLE_VAULT;1.1;AES256;user_key\n        62313365396662343061393464336163383764373764613633653634306231386433626436623361\n        6134333665353966363534333632666535333761666131620a663537646436643839616531643561\n        63396265333966386166373632626539326166353965363262633030333630313338646335303630\n        3438626666666137650a353638643435666633633964366338633066623234616432373231333331\n        6564\n      ansible_password: !vault |\n        $ANSIBLE_VAULT;1.1;AES256;pass_key\n        62313365396662343061393464336163383764373764613633653634306231386433626436623361\n        6134333665353966363534333632666535333761666131620a663537646436643839616531643561\n        63396265333966386166373632626539326166353965363262633030333630313338646335303630\n        3438626666666137650a353638643435666633633964366338633066623234616432373231333331\n        6564\n---\n- hosts: all\n  tasks:\n    - name: Test connection\n      ping:\nansible-playbook playbook.yml --ask-vault-pass -i inventory.yml</pre>' }
      ] },
    { title: 'Quiz 1', title_en: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle commande chiffre une valeur pour la placer dans une variable ?', q_en: 'Which command turns a value into a Vault-protected string that can be placed in a variable?',
        options: ['ansible-vault edit (fichier existant)', 'ansible-vault encrypt_string (valeur)', 'ansible-vault create (nouveau fichier)'],
        options_en: ['ansible-vault edit (existing file)', 'ansible-vault encrypt_string (value)', 'ansible-vault create (new file)'], answer: 1,
        explain: 'Slide 139 : <code>ansible-vault encrypt_string</code> stocke une variable chiffrée ; la slide 138 utilise <code>create</code>, <code>edit</code> et <code>encrypt</code> pour des fichiers.',
        explain_en: 'Slide 139: <code>ansible-vault encrypt_string</code> stores an encrypted variable; slide 138 uses <code>create</code>, <code>edit</code> and <code>encrypt</code> for files.', ref: [138, 139] }
    ] },
    { title: 'Quiz 2', title_en: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle option permet de saisir le mot de passe du vault au clavier au lancement du playbook ?', q_en: 'Which option lets you type the vault password at the keyboard when the playbook starts?',
        options: ['--ask-vault-pass', '--vault-password-file', '--vault-id'],
        options_en: ['--ask-vault-pass', '--vault-password-file', '--vault-id'], answer: 0,
        explain: 'Slide 139 : <code>ansible-playbook --ask-vault-pass --vault-id test1 -i inventory.yml my_playbook.yml</code> ; <code>--vault-password-file</code> lit le mot de passe dans un fichier.',
        explain_en: 'Slide 139: <code>ansible-playbook --ask-vault-pass --vault-id test1 -i inventory.yml my_playbook.yml</code>; <code>--vault-password-file</code> reads the password from a file.', ref: [139] }
    ] },
    { title: 'Quiz 3', title_en: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que peut chiffrer Ansible Vault ?', q_en: 'What can Ansible Vault encrypt?',
        options: ['Des fichiers entiers, mais pas des variables isolées', 'Les secrets d\'un inventaire, pas les playbooks', 'Des fichiers entiers ou des variables précises'],
        options_en: ['Whole files, but not individual variables', 'The secrets of an inventory, not playbooks', 'Whole files or specific variables'], answer: 2,
        explain: 'Slide 136 : « Flexibility: Encrypt entire files or specific variables within a file ».',
        explain_en: 'Slide 136: “Flexibility: Encrypt entire files or specific variables within a file”.', ref: [136] }
    ] }
  ],
  takeaways: [
    { html: 'Ansible Vault chiffre des variables, des fichiers et des playbooks entiers pour protéger les informations sensibles.', html_en: 'Ansible Vault encrypts variables, files and whole playbooks to protect sensitive information.', ref: [136] },
    { html: 'Il peut chiffrer un fichier entier ou seulement certaines variables d\'un fichier.', html_en: 'It can encrypt a whole file or only some variables of a file.', ref: [136] },
    { html: '<code>ansible-vault encrypt_string</code> produit une valeur chiffrée au format <code>!vault</code>, utilisable dans n\'importe quel emplacement de variables.', html_en: '<code>ansible-vault encrypt_string</code> produces an encrypted value in the <code>!vault</code> format, usable anywhere variables are defined.', ref: [139] },
    { html: 'Le mot de passe est fourni à l\'exécution avec <code>--ask-vault-pass</code> ou <code>--vault-password-file</code>, et <code>--vault-id</code> désigne l\'identifiant du vault.', html_en: 'You provide the password at run time with <code>--ask-vault-pass</code> or <code>--vault-password-file</code>; <code>--vault-id</code> sets the vault identifier.', ref: [139] },
    { html: 'Dans un inventaire, <code>ansible_user</code> et <code>ansible_password</code> peuvent être des valeurs chiffrées.', html_en: 'In an inventory, <code>ansible_user</code> and <code>ansible_password</code> can be encrypted values.', ref: [140] },
    { html: 'Les données chiffrées s\'intègrent dans les workflows Ansible existants sans changement important.', html_en: 'Encrypted data fits into existing Ansible workflows without major changes.', ref: [136] }
  ]
});
