/* Module 10 — Vault (slides PPTX 135 à 141). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm10', num: 10, emoji: '🔒',
  title: 'Vault',
  tagline: 'Chiffrer les données sensibles avec Ansible Vault.',
  objectives: [
    { html: 'Définir Ansible Vault : stocker et gérer en sécurité des données sensibles (mots de passe, clés, secrets).', ref: [136] },
    { html: 'Chiffrer et modifier un fichier avec <code>ansible-vault create</code>, <code>edit</code> et <code>encrypt</code>.', ref: [138] },
    { html: 'Chiffrer une valeur avec <code>encrypt_string</code> pour la placer dans une variable.', ref: [139] },
    { html: 'Fournir le mot de passe du vault avec <code>--ask-vault-pass</code> ou <code>--vault-password-file</code>.', ref: [139] },
    { html: 'Chiffrer <code>ansible_user</code> et <code>ansible_password</code> dans un inventaire.', ref: [140, 141] }
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
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle commande chiffre une valeur pour la placer dans une variable ?',
        options: ['ansible-vault edit (fichier existant)', 'ansible-vault encrypt_string (valeur)', 'ansible-vault create (nouveau fichier)'], answer: 1,
        explain: 'Slide 139 : <code>ansible-vault encrypt_string</code> stocke une variable chiffrée ; la slide 138 utilise <code>create</code>, <code>edit</code> et <code>encrypt</code> pour des fichiers.', ref: [138, 139] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle option permet de saisir le mot de passe du vault au clavier au lancement du playbook ?',
        options: ['--ask-vault-pass', '--vault-password-file', '--vault-id'], answer: 0,
        explain: 'Slide 139 : <code>ansible-playbook --ask-vault-pass --vault-id test1 -i inventory.yml my_playbook.yml</code> ; <code>--vault-password-file</code> lit le mot de passe dans un fichier.', ref: [139] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que peut chiffrer Ansible Vault ?',
        options: ['Des fichiers entiers, mais pas des variables isolées', 'Les secrets d\'un inventaire, pas les playbooks', 'Des fichiers entiers ou des variables précises'], answer: 2,
        explain: 'Slide 136 : « Flexibility: Encrypt entire files or specific variables within a file ».', ref: [136] }
    ] }
  ],
  takeaways: [
    { html: 'Ansible Vault chiffre des variables, des fichiers et des playbooks entiers pour protéger les informations sensibles.', ref: [136] },
    { html: 'Il peut chiffrer un fichier entier ou seulement certaines variables d\'un fichier.', ref: [136] },
    { html: '<code>ansible-vault encrypt_string</code> produit une valeur chiffrée au format <code>!vault</code>, utilisable dans n\'importe quel emplacement de variables.', ref: [139] },
    { html: 'Le mot de passe est fourni à l\'exécution avec <code>--ask-vault-pass</code> ou <code>--vault-password-file</code>, et <code>--vault-id</code> désigne l\'identifiant du vault.', ref: [139] },
    { html: 'Dans un inventaire, <code>ansible_user</code> et <code>ansible_password</code> peuvent être des valeurs chiffrées.', ref: [140] },
    { html: 'Les données chiffrées s\'intègrent dans les workflows Ansible existants sans changement important.', ref: [136] }
  ]
});
