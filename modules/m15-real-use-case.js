/* Module 13 — Real use case (slides PPTX 183 à 192). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm15', num: 15, emoji: '🌐',
  title: 'Real use case',
  tagline: 'Étudier un cas concret : un testeur de flux réseau automatisé avec Ansible.',
  objectives: [
    { html: 'Décrire l\'objectif de l\'exemple : vérifier que des flux réseau sont ouverts entre deux serveurs.', ref: [194] },
    { html: 'Identifier les éléments qui définissent un flux : serveur source, serveur destination, protocole réseau (TCP/UDP/HTTP) et message de connexion.', ref: [194] },
    { html: 'Lire la matrice d\'entrée et la matrice de sortie des flux.', ref: [197] },
    { html: 'Suivre les étapes du playbook : source joignable en SSH, test de connectivité, destination joignable en SSH, test avec le module.', ref: [198, 199, 200, 201] },
    { html: 'Interpréter les résultats de l\'arbre de décision (SRC ERROR, DST ERROR, PORT IS OPEN, PORT IS CLOSED).', ref: [196] }
  ],
  slides: [
    { title: 'Cas concret', src: [193],
      blocks: [
        { t: 'text', html: 'Network tester' }
      ] },
    { title: 'Real-Life Example : Network tester', src: [194],
      blocks: [
        { t: 'text', html: 'Objective:' },
        { t: 'text', html: 'Verify that network flows are open between two servers' },
        { t: 'text', html: '<b>Constraints:</b>' },
        { t: 'bullets', items: ['The flow may be blocked by a firewall', 'The flow may be open, but no service is listening', 'The flow is defined by:<ul><li>A source server</li><li>A destination server</li><li>A network protocol (TCP/UDP/HTTP)</li><li>A connection message</li></ul>'] }
      ] },
    { title: 'Schema de flux', src: [195],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 720 330" role="img" aria-labelledby="m15-svg1-t" aria-describedby="m15-svg1-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m15-svg1-t">Schéma de flux</title><desc id="m15-svg1-d">Un serveur Source et un serveur Destination ; le serveur de gestion (Management, Ansible) pilote les deux et teste le flux de Source vers Destination.</desc><defs><marker id="ar-m15-svg1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="90" y="60" width="120" height="60" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="150.0" y="77" text-anchor="middle" font-weight="700">Source</text><rect x="504" y="60" width="120" height="60" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="564.0" y="77" text-anchor="middle" font-weight="700">Destination</text><rect x="270" y="200" width="192" height="99" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="366.0" y="217" text-anchor="middle" font-weight="700">Management</text><text x="366" y="238" text-anchor="middle" font-weight="700">Ansible</text><line x1="300" y1="198" x2="200" y2="124" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg1)"/><line x1="430" y1="198" x2="530" y2="124" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg1)"/><line x1="212" y1="90" x2="502" y2="90" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg1)"/></svg>' }
      ] },
    { title: 'Decision TREE', src: [196],
      blocks: [
        { t: 'diagram', wide: true, html: '<svg viewBox="0 0 720 420" role="img" aria-labelledby="m15-svg2-t" aria-describedby="m15-svg2-d" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="13" fill="currentColor"><title id="m15-svg2-t">Arbre de décision du testeur de flux</title><desc id="m15-svg2-d">Si la source n\'est pas joignable en SSH : SRC ERROR. Sinon, si le port de destination est joignable : PORT IS OPEN. Sinon, si la destination n\'est pas joignable en SSH : DST ERROR. Sinon, test avec le module : si le port est joignable PORT IS OPEN, sinon PORT IS CLOSED.</desc><defs><marker id="ar-m15-svg2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs><rect x="250" y="10" width="220" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="360.0" y="27" text-anchor="middle" font-weight="700">SRC accessible via SSH?</text><rect x="30" y="10" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="90.0" y="27" text-anchor="middle" font-weight="700">SRC ERROR</text><line x1="248" y1="30" x2="152" y2="30" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="200" y="24" text-anchor="middle">NO</text><line x1="360" y1="52" x2="360" y2="98" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="376" y="80" text-anchor="start">YES</text><rect x="250" y="100" width="220" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="360.0" y="117" text-anchor="middle" font-weight="700">DST port reachable?</text><rect x="560" y="100" width="140" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="117" text-anchor="middle" font-weight="700">PORT IS OPEN</text><line x1="472" y1="120" x2="558" y2="120" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="515" y="114" text-anchor="middle">YES</text><line x1="360" y1="142" x2="360" y2="188" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="376" y="170" text-anchor="start">NO</text><rect x="250" y="190" width="220" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="360.0" y="207" text-anchor="middle" font-weight="700">DST Accessible via SSH?</text><rect x="30" y="190" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="90.0" y="207" text-anchor="middle" font-weight="700">DST ERROR</text><line x1="248" y1="210" x2="152" y2="210" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="200" y="204" text-anchor="middle">NO</text><line x1="360" y1="232" x2="360" y2="278" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="376" y="260" text-anchor="start">YES</text><rect x="250" y="280" width="220" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><text x="360.0" y="297" text-anchor="middle" font-weight="700">DST Port Reachable with module?</text><rect x="560" y="280" width="140" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="630.0" y="297" text-anchor="middle" font-weight="700">PORT IS OPEN</text><line x1="472" y1="300" x2="558" y2="300" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="515" y="294" text-anchor="middle">YES</text><line x1="360" y1="322" x2="360" y2="368" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-m15-svg2)"/><text x="376" y="350" text-anchor="start">NO</text><rect x="280" y="370" width="160" height="40" rx="8" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/><text x="360.0" y="387" text-anchor="middle" font-weight="700">PORT IS CLOSED</text></svg>' }
      ] },
    { title: 'Cas concret: data', src: [197],
      blocks: [
        { t: 'text', html: '<b>Données d’entrée :</b>' },
        { t: 'code', lang: 'yaml', code: `matrix:
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 2222, Proto: http, Message: 'http://127.0.0.1'}
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 2222, Proto: udp, Message: 'test'}
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 22, Proto: tcp, Message: 'test' }` },
        { t: 'text', html: '<b>Données de sortie :</b>' },
        { t: 'code', lang: 'yaml', code: `matrix:
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 2222, Proto: http,\\
     Message: 'http://127.0.0.1', Status: NO ACCESS with private service, Result1: [], Result2: []}
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 2222, Proto: udp,\\
    Message: 'test', Status: OK, Result1: [], Result2: ['test']}
  - {SRC: 192.0.2.218, DST: 192.0.2.219, Port: 22, Proto: tcp,\\
    Message: 'test', Status: OK, Result1: ['SSH-2.0-OpenSSH_9.x', 'Protocol mismatch.'], Result2: []}` }
      ] },
    { title: 'Cas concret: 1) SRC SSH', src: [198],
      blocks: [
        { t: 'code', lang: 'yaml', code: `1) Check the SOURCE server is SSH reachable


  - name:  SRC SSHabble
    wait_for: host="{{Flux.SRC}}" port=22 state=started delay=0 timeout=1 connect_timeout=1
    register: SRC_test

  rescue:
  - name: SRC not SSHable
    set_fact: result="SRC ERROR"` }
      ] },
    { title: 'Cas concret: 2) connectivity', src: [199],
      blocks: [
        { t: 'code', lang: 'yaml', code: `2) Check Connectivity from SOURCE to DESTINATION

  - name: 1st test TCP
    sockClient: BindIP="{{Flux.DST}}" Port="{{Flux.Port}}" Protocol="{{Flux.Proto}}" Message="{{Flux.Message}}"
    register: test1
    delegate_to: "{{Flux.SRC}}"
    remote_user: ansible_user` }
      ] },
    { title: 'Cas concret: 3) DST SSH', src: [200],
      blocks: [
        { t: 'code', lang: 'yaml', code: `3) No Connectivity: check that DESTINATION server is SSH reachable


##### SRC is SSHable and DST Port not open
      - name: test remote SSH
        wait_for: host="{{Flux.DST|default(Flux.DST)}}" port=22  state=started delay=0
 timeout=1 connect_timeout=1

      - name: DST Port not reachable
        set_fact: result="PORT CLOSED"

      rescue:
        - name: DST not SSHable
          set_fact: result="DST ERROR"` }
      ] },
    { title: 'Cas concret: 4) module', src: [201],
      blocks: [
        { t: 'code', lang: 'yaml', code: `4) Check connectivity with our module

  - name: setup new server
    sockServer: Port="{{Flux.BACKENDPort|default(Flux.Port)}}" Protocol="{{Flux.Proto}}"
    async: 10
    delegate_to: "{{Flux.BACKEND|default(Flux.DST)}}"
    remote_user: ansible_user
    become: true
    become_user: root

  - name: 2nd test TCP local
    #script: templates/sockClient.py "{{Flux.DST}}" "{{Flux.Port}}" "{{Flux.Proto}}" "toto"
    sockClient: BindIP="{{Flux.DST}}" Port="{{Flux.Port}}" Protocol="{{Flux.Proto}}" Message="{{Flux.Message}}"
    delegate_to: "{{Flux.SRC}}"
    register: test2
    remote_user: ansible_user

  - name: setting result OK
    set_fact: result="OK"

5) No connection: the network is firewalled :

  - name: setting result ERROR
    set_fact: result="NO ACCESS with private service"` }
      ] },
    { title: 'Cas concret: 6) update matrix', src: [202],
      blocks: [
        { t: 'code', lang: 'yaml', code: `6) Update the file matrix with the resulting status
- name: save result
  lineinfile:
    dest="{{inventory}}"
    regexp="(?! .#)(?!.*BACKEND.*)( {{Flux.SRC}},.* {{Flux.DST}},.* {{Flux.Port}},.* {{Flux.Proto}},.*{{Flux.Message}}.*)$"
    line="  - {SRC{{":"}} {{Flux.SRC}}, DST{{":"}} {{Flux.DST}}, Port{{":"}} {{Flux.Port}}, Proto{{":"}} {{Flux.Proto}}, Message{{":"}}
 '{{Flux.Message}}', Status{{":"}} {{result}}, Result1{{":"}} {{test1.stdout_lines|default("")}}, Result2{{":"}} {{test2.stdout_lines|default("")}}}"` }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Dans l\'exemple de la slide 188, quel résultat est positionné quand le serveur source n\'est pas joignable en SSH ?',
        options: ['PORT CLOSED', 'SRC ERROR', 'DST ERROR'], answer: 1,
        explain: 'Dans le bloc <code>rescue</code> de la slide 188, la tâche « SRC not SSHable » positionne <code>result="SRC ERROR"</code>.', ref: [198] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Quel résultat est positionné quand la destination est joignable en SSH mais que le port testé n\'est pas ouvert ?',
        options: ['PORT CLOSED', 'DST ERROR', 'SRC ERROR'], answer: 0,
        explain: 'Slide 190 : la tâche « DST Port not reachable » positionne <code>result="PORT CLOSED"</code>, alors que <code>result="DST ERROR"</code> est positionné dans <code>rescue</code> quand la destination n\'est pas joignable en SSH.', ref: [200] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Dans la matrice de sortie, quel statut est affiché pour un service privé inaccessible ?',
        options: ['PORT CLOSED with private service', 'DST ERROR with private service', 'NO ACCESS with private service'], answer: 2,
        explain: 'Slide 187 : le premier flux (http, port 2222) a pour statut « NO ACCESS with private service ».', ref: [197] }
    ] }
  ],
  takeaways: [
    { html: 'L\'exemple vérifie que des flux réseau sont ouverts entre deux serveurs.', ref: [194] },
    { html: 'Un flux peut être bloqué par un pare-feu, ou ouvert sans qu\'aucun service n\'écoute.', ref: [194] },
    { html: 'Un flux est défini par un serveur source, un serveur destination, un protocole (TCP/UDP/HTTP) et un message de connexion.', ref: [194] },
    { html: 'Le playbook commence par vérifier que le serveur source est joignable en SSH, avec <code>wait_for</code> et <code>rescue</code>.', ref: [198] },
    { html: 'Le test de connectivité est délégué au serveur source avec <code>delegate_to</code>.', ref: [199] },
    { html: 'Le résultat est enregistré dans la matrice avec <code>lineinfile</code>.', ref: [202] }
  ]
});
