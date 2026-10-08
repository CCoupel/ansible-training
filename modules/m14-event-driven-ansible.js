/* Module 14 — Event-Driven Ansible (slides PPTX 193 à 223). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm14', num: 14, emoji: '⚡',
  title: 'Event-Driven Ansible',
  tagline: "Déclencher l'automatisation par des événements : sources, rulebooks, conditions et actions avec ansible-rulebook.",
  objectives: [
    { html: 'Expliquer le principe de l\'automatisation événementielle : une source produit des événements, une règle décide, une action s\'exécute.', ref: [194, 195] },
    { html: 'Décrire l\'anatomie d\'un ruleset (<code>name</code>, <code>hosts</code>, <code>sources</code>, <code>rules</code>) et écrire un premier rulebook avec une source <code>webhook</code>.', ref: [198, 199] },
    { html: 'Écrire des conditions avec les opérateurs, <code>all</code> et <code>any</code>, et limiter le déclenchement avec <code>throttle</code>.', ref: [205, 207, 209] },
    { html: 'Choisir une action : <code>run_playbook</code>, <code>run_module</code>, <code>run_job_template</code>, <code>debug</code> ou <code>post_event</code>.', ref: [210] },
    { html: 'Lancer et déboguer un rulebook avec <code>ansible-rulebook</code> et situer le decision environment et l\'EDA controller.', ref: [215, 216, 217, 218] }
  ],
  slides: [
    { title: 'Event-Driven Ansible', src: [193],
      blocks: [
        { t: 'text', html: 'Run automation when an event happens, not only when someone starts it' },
        { t: 'text', html: 'Sources produce events, rules decide, actions run' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/rulebook/en/stable/" target="_blank" rel="noopener">https://docs.ansible.com/projects/rulebook/en/stable/</a>' }
      ] },
    { title: 'Why event-driven?', src: [194],
      blocks: [
        { t: 'bullets', items: [
          'Scheduled or manual automation<ul><li>A playbook runs when a person or a schedule starts it</li></ul>',
          'Event-driven automation<ul><li>A rulebook waits for events and runs automation as soon as one matches</li></ul>',
          'Typical use cases<ul><li>Remediation: restart a failed service</li><li>Ticket enrichment: add context to a new ticket</li><li>Reaction to monitoring alerts</li></ul>',
          'The playbooks you already have are reused as actions'
        ] }
      ] },
    { title: 'Architecture: source, rule, action', src: [195],
      blocks: [
        { t: 'flow', nodes: [{ label: 'Event source', sub: 'webhook, Kafka, Alertmanager, file watch...' }, { label: 'Rulebook: rules', sub: 'condition: does the event match?', hl: true }, { label: 'Action', sub: 'run_playbook, run_job_template, debug...' }] },
        { t: 'text', html: 'ansible-rulebook is the process that connects the three' },
        { t: 'text', html: 'If the condition matches the event, then the action runs' }
      ] },
    { title: 'Components', src: [196],
      blocks: [
        { t: 'bullets', items: [
          'ansible-rulebook<ul><li>The command-line tool that runs rulebooks</li></ul>',
          'ansible.eda collection<ul><li>Event sources and filters: webhook, range, generic, kafka...</li></ul>',
          'Decision environment<ul><li>A container image, like an execution environment, that holds ansible-rulebook, collections and dependencies</li></ul>',
          'EDA controller<ul><li>The Event Driven Ansible Controller: a server that manages and runs rulebooks</li></ul>'
        ] }
      ] },
    { title: 'Installation', src: [197],
      blocks: [
        { t: 'code', lang: 'console', code: `# Optional: a virtual environment
$ python3 -m venv .venv
$ . .venv/bin/activate

# Fedora-like system (Ubuntu: openjdk-17-jdk)
$ dnf --assumeyes install java-17-openjdk python3-pip
$ export JAVA_HOME=/usr/lib/jvm/jre-17-openjdk

$ pip install ansible-rulebook ansible ansible-runner
$ ansible-galaxy collection install ansible.eda
$ ansible-rulebook --version` },
        { t: 'bullets', items: [
          'Python 3.9 or later and Java 17 or later (JDK) are required',
          'Set JAVA_HOME when several Java versions are installed',
          'The collection brings the event sources and filters',
          'Its Python dependencies are listed in its requirements.txt',
          'Container alternative: podman pull quay.io/ansible/ansible-rulebook:latest'
        ] }
      ] },
    { title: 'Anatomy of a ruleset', src: [198],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: My ruleset
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: React to a down service
      condition: event.payload.status == "down"
      action:
        debug:` },
        { t: 'bullets', items: [
          'A rulebook is a list of rulesets',
          'name: unique in the rulebook',
          'hosts: used by run_playbook and run_module',
          'sources: where events come from',
          'rules: condition + action',
          'Optional: gather_facts, default_events_ttl'
        ] }
      ] },
    { title: 'Your first rulebook', src: [199],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: First rulebook
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Show every event
      condition: event.meta is defined
      action:
        debug:
          msg: "Received: {{ event.payload }}"` },
        { t: 'code', lang: 'yaml', code: `# inventory.yml
---
all:
  hosts:
    localhost:
      ansible_connection: local` },
        { t: 'code', lang: 'console', code: `$ ansible-rulebook \\
    --rulebook first.yml \\
    -i inventory.yml

# In another terminal
$ curl -X POST \\
    -H "Content-Type: application/json" \\
    -d '{"status": "down"}' \\
    http://127.0.0.1:5000/alert` },
        { t: 'bullets', items: [
          'The rule fires and debug prints the message',
          '--rulebook needs -i (an inventory)'
        ] }
      ] },
    { title: 'Event sources overview', src: [200],
      blocks: [
        { t: 'text', html: 'Sources of the ansible.eda collection' },
        { t: 'bullets', items: [
          'webhook: receive JSON over HTTP POST',
          'kafka: receive events from a Kafka topic',
          'alertmanager: alerts from Alertmanager or a compatible system',
          'url_check: poll URLs and send their status',
          'file_watch: watch file system changes',
          'journald: tail systemd journald logs',
          'range and generic: generate test events'
        ] },
        { t: 'text', html: 'In a rulebook: ansible.eda.&lt;source&gt; with its options under sources' },
        { t: 'text', html: 'ansible-rulebook also has builtin sources: eda.builtin.range, generic, webhook, pg_listener' }
      ] },
    { title: 'Source: webhook', src: [201],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Authenticated webhook
  hosts: localhost
  sources:
    - name: Listen with a token
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
        token: my-secret-token
  rules:
    - name: Service is down
      condition: event.payload.status == "down"
      action:
        debug:
          msg: "{{ event.payload.service }} is down"` },
        { t: 'bullets', items: [
          'host: default 0.0.0.0<ul><li>127.0.0.1 keeps it local</li></ul>',
          'port: required',
          'token: clients send a Bearer token',
          'hmac_secret, hmac_algo, hmac_header: signed payloads',
          'certfile, keyfile: TLS'
        ] },
        { t: 'code', lang: 'console', code: `$ curl -X POST -H "Authorization: Bearer my-secret-token" \\
    -H "Content-Type: application/json" \\
    -d '{"status": "down", "service": "web"}' \\
    http://127.0.0.1:5000/alert
# my-secret-token is a demo value` }
      ] },
    { title: 'Testing sources and event filters', src: [202],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Test with generic events
  hosts: localhost
  sources:
    - name: Fake events
      ansible.eda.generic:
        payload:
          - status: down
            service: web
          - status: up
            service: web
      filters:
        - ansible.eda.json_filter:
            exclude_keys: [service]
  rules:
    - name: Show what is left
      condition: event.status == "down"
      action:
        debug:` },
        { t: 'bullets', items: [
          'generic: events written in the rulebook',
          'range: events with an index i (option limit)',
          'When a source ends, the rulebook ends',
          'Filters change events before rules see them',
          'json_filter: remove or keep keys',
          'insert_hosts_to_meta: set the hosts of an event',
          'Builtin copies exist as eda.builtin.*'
        ] }
      ] },
    { title: 'Structure of an event', src: [203],
      blocks: [
        { t: 'code', lang: 'json', code: `{
  "payload": {
    "status": "down",
    "service": "web"
  },
  "meta": {
    "endpoint": "alert",
    "headers": { ... }
  }` },
        { t: 'bullets', items: [
          'webhook event structure',
          'event.payload: the JSON body sent',
          'event.meta: endpoint and request headers',
          'Each source defines its own event',
          'range: event.i',
          'See real events',
          'debug action without msg',
          'ansible-rulebook --print-events',
          'In a rule: event.payload.status, event.meta.endpoint'
        ] }
      ] },
    { title: 'Conditions: the basics', src: [204],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Conditions basics
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Service is down
      condition: event.payload.status == "down"
      action:
        debug:
          msg: "{{ event.payload.service }} is down"` },
        { t: 'bullets', items: [
          'A condition decides if the rule fires',
          'event = the event being tested',
          'Dot or bracket notation<ul><li>event.payload["status"]</li></ul>',
          'Types: integers, strings, booleans, floats, null'
        ] }
      ] },
    { title: 'Conditions: operators', src: [205],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Operators
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Disk almost full
      condition: event.payload.disk > 90 and event.payload.env == "prod"
      action:
        debug:
    - name: Known service
      condition: event.payload.service in ["web", "db"]
      action:
        debug:
    - name: Urgent tag
      condition: event.payload.tags contains "urgent"
      action:
        debug:
    - name: Has a message
      condition: event.payload.message is defined
      action:
        debug:` },
        { t: 'bullets', items: [
          'Compare: == != &lt; &gt; &lt;= &gt;=',
          'Combine: and, or, not',
          'in: value is in a list',
          'contains: list has a value',
          'is defined, is not defined'
        ] },
        { t: 'code', lang: 'console', code: `# Send with curl -d (same options as before):
# disk almost full
-d '{"disk": 95, "env": "prod"}'
# known service
-d '{"service": "web"}'
# urgent tag
-d '{"tags": ["urgent"]}'
# has a message
-d '{"message": "hello"}'` }
      ] },
    { title: 'Conditions: strings and selectattr', src: [206],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Strings and lists
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Web host
      condition: event.payload.host is match("web", ignorecase=true)
      action:
        debug:
    - name: Timeout message
      condition: event.payload.message is search("timeout", ignorecase=true)
      action:
        debug:
    - name: Version 2.x
      condition: event.payload.version is regex("^2\\.[0-9]+")
      action:
        debug:
    - name: A full disk
      condition: event.payload.disks is selectattr('used', '>=', 90)
      action:
        debug:` },
        { t: 'bullets', items: [
          'is match: pattern at the start',
          'is search: pattern anywhere',
          'is regex: regular expression',
          'is selectattr(key, operator, value)',
          'tests the objects of a list'
        ] },
        { t: 'code', lang: 'console', code: `# Send with curl -d (same options as before):
# web host
-d '{"host": "web01"}'
# timeout message
-d '{"message": "Connection timeout"}'
# version 2.x
-d '{"version": "2.4"}'
# a full disk
-d '{"disks": [{"used": 95}]}'` }
      ] },
    { title: 'Conditions: all, any, not_all', src: [207],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Several events
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Down and disk full
      condition:
        all:
          - event.payload.status == "down"
          - event.payload.disk > 90
        timeout: 10 seconds
      action:
        debug:
          msg: "{{ events.m_0.payload.service }} is down"
    - name: Any alert
      condition:
        any:
          - event.payload.severity == "critical"
          - event.payload.status == "down"
      action:
        debug:` },
        { t: 'bullets', items: [
          'all: every condition, from different events',
          'any: one of the conditions',
          'not_all: only some conditions matched in the timeout',
          'events.m_0, events.m_1: matched events',
          'In the condition of an all, write event.payload...; in the action, use events.m_0...',
          'all is not and, any is not or'
        ] },
        { t: 'code', lang: 'console', code: `# Send with curl -d (same options as before):
# all: two events within 10 seconds
-d '{"status": "down", "service": "web"}'
-d '{"disk": 95}'
# any: one event is enough
-d '{"severity": "critical"}'` }
      ] },
    { title: 'Facts and variables', src: [208],
      blocks: [
        { t: 'code', lang: 'yaml', code: `# facts.yml
---
- name: Facts and variables
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Start maintenance
      condition: event.payload.maintenance == true
      action:
        set_fact:
          fact:
            maintenance: true
    - name: Alert during maintenance
      condition:
        all:
          - fact.maintenance == true
          - event.payload.env == vars.target_env
      action:
        debug:
          msg: "Reported by {{ MY_NAME }}"` },
        { t: 'code', lang: 'yaml', code: `# vars.yml
---
target_env: prod` },
        { t: 'code', lang: 'console', code: `$ MY_NAME="Bob" \\
  ansible-rulebook \\
    -r facts.yml -i inventory.yml \\
    --vars vars.yml \\
    --env-vars MY_NAME` },
        { t: 'code', lang: 'console', code: `# Send with curl -d (same options as before):
-d '{"maintenance": true}'
-d '{"env": "prod"}'` },
        { t: 'bullets', items: [
          'fact. = saved by set_fact',
          'vars. in conditions, {{ }} elsewhere',
          '--env-vars values are strings'
        ] }
      ] },
    { title: 'Throttle', src: [209],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Throttle
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Notify once per service
      condition: event.payload.status == "down"
      throttle:
        once_within: 5 minutes
        group_by_attributes:
          - event.payload.host
          - event.payload.service
      action:
        debug:
          msg: "{{ event.payload.service }} is down"` },
        { t: 'bullets', items: [
          'An event storm would run the action many times',
          'once_within: act on the first, ignore the next ones for the delay',
          'once_after: wait, then act once on the group',
          'group_by_attributes is mandatory',
          'Single condition only'
        ] }
      ] },
    { title: 'Actions overview', src: [210],
      blocks: [
        { t: 'bullets', items: [
          'Run automation<ul><li>run_playbook, run_module</li><li>run_job_template, run_workflow_template (on a controller)</li></ul>',
          'Show information<ul><li>debug, print_event</li></ul>',
          'Feed the rules engine<ul><li>set_fact, retract_fact, post_event</li></ul>',
          'Stop or do nothing<ul><li>shutdown, none (no action, useful for tests)</li></ul>'
        ] },
        { t: 'text', html: 'One action: action:. Several actions: actions: (run in order)' }
      ] },
    { title: 'Action: run_playbook', src: [211],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Run a playbook
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Restart the service
      condition: event.payload.status == "down"
      action:
        run_playbook:
          name: restart_service.yml
          extra_vars:
            service_name: "{{ event.payload.service }}"` },
        { t: 'code', lang: 'yaml', code: `# restart_service.yml
---
- name: Handle the event
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the service name
      ansible.builtin.debug:
        msg: "Restart {{ service_name }}"
    - name: Show the event
      ansible.builtin.debug:
        msg: "{{ ansible_eda.event }}"` },
        { t: 'bullets', items: [
          'name: playbook path, relative to where ansible-rulebook runs, or FQCN',
          'extra_vars: variables for the playbook',
          'ansible_eda.event: the matching event, added automatically',
          'ansible_eda.events for several matches',
          'Also: retries, delay, verbosity'
        ] }
      ] },
    { title: 'Action: run_module', src: [212],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Run a module
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Leave a marker file
      condition: event.payload.status == "down"
      action:
        run_module:
          name: ansible.builtin.copy
          module_args:
            content: "{{ event.payload.service }} is down"
            dest: /tmp/eda-last-down.txt
            mode: "0644"` },
        { t: 'bullets', items: [
          'run_module runs one module, no playbook needed',
          'name: the module FQCN',
          'module_args: its arguments',
          'Same options as run_playbook: retries, delay, extra_vars',
          'Runs on the hosts of the ruleset'
        ] }
      ] },
    { title: 'Multiple actions and post_event', src: [213],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Several actions
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Open an incident
      condition: event.payload.status == "down"
      actions:
        - debug:
            msg: "{{ event.payload.service }} is down"
        - post_event:
            event:
              incident: "{{ event.payload.service }}"
    - name: Handle the incident
      condition: event.incident is defined
      action:
        debug:
          msg: "Incident for {{ event.incident }}"` },
        { t: 'bullets', items: [
          'actions: runs several actions in order',
          'each one waits for the previous',
          'post_event sends a new event to the ruleset',
          'another rule can react to it',
          'Chain small rules instead of one big rule'
        ] }
      ] },
    { title: 'Action: run_job_template', src: [214],
      blocks: [
        { t: 'code', lang: 'yaml', code: `---
- name: Run a job template
  hosts: localhost
  sources:
    - name: Listen for alerts
      ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Restart through the controller
      condition: event.payload.status == "down"
      action:
        run_job_template:
          name: Restart service
          organization: Default
          job_args:
            extra_vars:
              service_name: "{{ event.payload.service }}"` },
        { t: 'code', lang: 'console', code: `$ ansible-rulebook -r rulebook.yml -i inventory.yml \\
    --controller-url https://controller.example.com \\
    --controller-token <token>` },
        { t: 'bullets', items: [
          'Runs a job template of a controller (for example AWX)',
          'Needs --controller-url and a token, or a user and a password',
          'To read ansible_eda in the job: enable Prompt on launch for Variables',
          'run_workflow_template works the same way'
        ] }
      ] },
    { title: 'ansible-rulebook: command line', src: [215],
      blocks: [
        { t: 'code', lang: 'console', code: `$ ansible-rulebook --rulebook rulebook.yml --inventory inventory.yml --verbose
$ ansible-rulebook -r rulebook.yml -i inventory.yml --vars vars.yml --env-vars MY_NAME` },
        { t: 'bullets', items: [
          '-r, --rulebook: a file, or a rulebook of a collection by FQCN',
          '-i, --inventory: required with --rulebook',
          '-e, --vars: variables file; -E, --env-vars: names of environment variables',
          '-v, -vv: more messages (maximum 2)',
          '--print-events: print the received events',
          '-S, --source-dir: your own source plugins',
          '--version: show the version'
        ] }
      ] },
    { title: 'Debugging a rulebook', src: [216],
      blocks: [
        { t: 'code', lang: 'console', code: `$ ansible-rulebook -r rulebook.yml -i inventory.yml -vv` },
        { t: 'code', lang: 'yaml', code: `action:
  print_event:
    pretty: true

# or, with no argument
action:
  debug:` },
        { t: 'bullets', items: [
          '-v / -vv: engine and event details',
          'Event debugging may need -vv',
          '--print-events is redundant with -vv',
          'print_event and debug show the matching event',
          'Check the event structure first, then the condition',
          'No rule fires?<ul><li>Compare the event with your condition</li><li>Check event or events prefix</li><li>Check the types: 90 is not "90"</li></ul>'
        ] }
      ] },
    { title: 'Decision environments', src: [217],
      blocks: [
        { t: 'code', lang: 'yaml', code: `# my_de.yml
---
version: 3

images:
  base_image:
    name: minimal-decision-environment:latest

dependencies:
  galaxy:
    collections:
      - name: ansible.utils` },
        { t: 'code', lang: 'console', code: `# 1. From a clone of the ansible-rulebook repository: build the minimal base image
$ ansible-builder build --file minimal-decision-environment.yml --tag minimal-decision-environment:latest
# 2. Build your own decision environment
$ ansible-builder build --file my_de.yml --tag my_de:1.0
# 3. Run a rulebook in it
$ echo "localhost ansible_connection=local" > inventory
$ podman run -it --rm -v "$PWD/inventory:/tmp/inventory" my_de:1.0 \\
    ansible-rulebook -r ansible.eda.hello_events -i /tmp/inventory` },
        { t: 'bullets', items: [
          'Decision environment: an execution environment for rulebooks',
          'Built with ansible-builder, like in module m13',
          'The minimal base image is built locally from the ansible-rulebook project',
          'Podman is the default runtime of ansible-builder'
        ] }
      ] },
    { title: 'EDA controller', src: [218],
      blocks: [
        { t: 'text', html: 'EDA controller: three objects' },
        { t: 'bullets', items: [
          'Project: a git repository with your rulebooks (URL, branch, credential)',
          'Decision environment: the image URL used to run them',
          'Rulebook activation: project + rulebook + decision environment, enabled or not',
          'A token lets rulebooks launch job templates'
        ] },
        { t: 'code', lang: 'yaml', code: `- name: Create an activation
  ansible.eda.rulebook_activation:
    name: Example Activation
    project: Example Project
    rulebook_name: basic_short.yml
    decision_environment_name:
      Example Decision Environment
    enabled: false` },
        { t: 'text', html: 'The same objects exist as modules of the ansible.eda collection (connection options not shown)' }
      ] },
    { title: 'Best practices', src: [219],
      blocks: [
        { t: 'bullets', items: [
          'Playbooks run by rules must be idempotent: an event can arrive twice',
          'Use throttle to absorb event storms',
          'Secure the webhook: token, HMAC or TLS; listen on 127.0.0.1 unless needed',
          'Keep secrets out of rulebooks: encrypt them with ansible-vault',
          'Keep the logic in the playbooks: rules only decide',
          'Name every ruleset and every rule: names must be unique in the rulebook',
          'Test with generic or range sources before a real source',
          'Store rulebooks in git, or in a collection: extensions/eda/rulebooks'
        ] }
      ] },
    { title: 'Exercise: webhook remediation', src: [220],
      blocks: [
        { t: 'text', html: 'An event arrives on a local webhook; a rule reacts and runs a playbook that simulates the restart of a service. Nothing real is restarted: the playbook only prints a message and writes a marker file in /tmp.' },
        { t: 'text', html: '<b>Prerequisites</b>' },
        { t: 'bullets', items: [
          'Java 17 or later (required by ansible-rulebook): java -version',
          'ansible-rulebook, ansible and ansible-runner: pip install ansible-rulebook ansible ansible-runner (the installation page of the Ansible Rulebook documentation lists exactly these three packages)',
          'The ansible.eda collection: ansible-galaxy collection install ansible.eda',
          'curl',
          'TCP port 5000 free on 127.0.0.1 (the webhook listens on this address only)'
        ] },
        { t: 'lab', title: 'Statement', steps: [
          '1. Write a rulebook with a ansible.eda.webhook source listening on 127.0.0.1, port 5000.',
          '2. Add a rule that fires when event.payload.status equals "down" and runs the playbook remediate.yml.',
          '3. Write remediate.yml: it prints a message naming the service received in the event (ansible_eda.event.payload.service, inserted in the playbook by the rulebook engine), then leaves a marker file /tmp/eda-lab-my_service.txt (simulated restart).',
          '4. Start the rulebook, then send events with curl from a second terminal.'
        ] },
        { t: 'text', html: 'The inventory inventory.yml only contains localhost.' }
      ] },
    { title: 'Exercise: test with curl', src: [221, 222],
      blocks: [
        { t: 'code', lang: 'console', code: `# Solution files are in solution/ (try the statement first)
cd solution
ansible-rulebook -r rulebook.yml -i ../inventory.yml --verbose

# In a second terminal: an event that must trigger the rule
curl -H 'Content-Type: application/json' -d '{"service": "my_service", "status": "down"}' http://127.0.0.1:5000/endpoint

# Then an event that must not trigger anything
curl -H 'Content-Type: application/json' -d '{"service": "my_service", "status": "up"}' http://127.0.0.1:5000/endpoint` },
        { t: 'text', html: '<b>Expected result</b>' },
        { t: 'bullets', items: [
          'First event: curl answers with HTTP 200, the rule Restart the simulated service fires, remediate.yml runs, the message Simulated restart of my_service is displayed and the file /tmp/eda-lab-my_service.txt exists.',
          'Second event: HTTP 200 but no rule fires and no playbook runs.'
        ] },
        { t: 'text', html: '<b>Clean up</b>' },
        { t: 'text', html: 'Stop the rulebook with Ctrl+C (the port is released), then: rm -f /tmp/eda-lab-my_service.txt' },
        { t: 'reveal', label: 'Exercise: solution', html: '<pre># rulebook.yml\n---\n- name: Service watchdog\n  hosts: localhost\n  sources:\n    - name: Listen for alerts\n      ansible.eda.webhook:\n        host: 127.0.0.1\n        port: 5000\n  rules:\n    - name: Restart the simulated service\n      condition: event.payload.status == "down"\n      action:\n        run_playbook:\n          name: remediate.yml\n# remediate.yml\n---\n- name: Restart the simulated service\n  hosts: localhost\n  gather_facts: false\n  tasks:\n    - name: Announce the simulated restart of the service in the event\n      ansible.builtin.debug:\n        msg: "Simulated restart of {{ ansible_eda.event.payload.service | default(\'unknown service\') }}"\n\n    - name: Leave a marker file\n      ansible.builtin.copy:\n        content: "{{ ansible_eda.event.payload.service | default(\'unknown service\') }} restarted\\n"\n        dest: /tmp/eda-lab-my_service.txt\n        mode: "0644"</pre>' }
      ] },
    { title: 'Documentation links', src: [223],
      blocks: [
        { t: 'text', html: 'Official documentation' },
        { t: 'text', html: 'Rulebooks, conditions, actions, decision environments' },
        { t: 'bullets', items: [
          '<a href="https://docs.ansible.com/projects/rulebook/en/stable/" target="_blank" rel="noopener">https://docs.ansible.com/projects/rulebook/en/stable/</a>',
          '<a href="https://github.com/ansible/ansible-rulebook" target="_blank" rel="noopener">https://github.com/ansible/ansible-rulebook</a>',
          '<a href="https://github.com/ansible/event-driven-ansible" target="_blank" rel="noopener">https://github.com/ansible/event-driven-ansible</a>',
          '<a href="https://galaxy.ansible.com/ui/repo/published/ansible/eda/content/" target="_blank" rel="noopener">https://galaxy.ansible.com/ui/repo/published/ansible/eda/content/</a>',
          '<a href="https://github.com/ansible/eda-server" target="_blank" rel="noopener">https://github.com/ansible/eda-server</a>'
        ] },
        { t: 'text', html: 'ansible-rulebook, the ansible.eda collection and the EDA controller each have their own repository' }
      ] },
    { title: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle clé d\'un ruleset contient les conditions et les actions ?',
        options: ['hosts', 'rules', 'sources', 'name'], answer: 1,
        explain: 'Slide 198 : « rules: condition + action » ; <code>sources</code> indique d\'où viennent les événements.', ref: [198] }
    ] },
    { title: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Avec <code>throttle</code>, que fait <code>once_within</code> ?',
        options: ['Il attend la fin du délai, puis exécute l\'action une fois pour le groupe', 'Il exécute l\'action sur chaque événement, en les espaçant du délai indiqué', 'Il agit sur le premier événement, puis ignore les suivants durant le délai'], answer: 2,
        explain: 'Slide 209 : « once_within: act on the first, ignore the next ones for the delay » ; <code>once_after</code> attend puis agit une fois sur le groupe.', ref: [209] }
    ] },
    { title: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Que fait l\'action <code>run_job_template</code> ?',
        options: ['Elle lance un job template sur un contrôleur comme AWX', 'Elle lance un playbook situé à côté du rulebook', 'Elle envoie un nouvel événement au même ruleset', 'Elle affiche l\'événement reçu dans la console'], answer: 0,
        explain: 'Slide 214 : « Runs a job template of a controller (for example AWX) » ; un playbook se lance avec <code>run_playbook</code> (slide 211), un nouvel événement s\'envoie avec <code>post_event</code> (slide 213).', ref: [210, 211, 213, 214] }
    ] }
  ],
  takeaways: [
    { html: 'Un rulebook est une liste de rulesets ; un ruleset a un <code>name</code>, des <code>hosts</code>, des <code>sources</code> et des <code>rules</code> ; chaque règle associe une <code>condition</code> et une <code>action</code>.', ref: [198] },
    { html: 'Les sources de la collection <code>ansible.eda</code> (<code>webhook</code>, <code>kafka</code>, <code>alertmanager</code>…) produisent les événements ; <code>generic</code> et <code>range</code> servent à tester.', ref: [200, 202] },
    { html: 'Dans une condition, <code>event.payload</code> donne le corps JSON reçu et <code>event.meta</code> l\'endpoint et les en-têtes de la requête.', ref: [203] },
    { html: 'Avec <code>all</code>, toutes les conditions doivent être vraies, sur des événements différents : <code>all</code> n\'est pas <code>and</code> et <code>any</code> n\'est pas <code>or</code>.', ref: [207] },
    { html: '<code>throttle</code> (<code>once_within</code> ou <code>once_after</code>, avec <code>group_by_attributes</code> obligatoire) évite qu\'une rafale d\'événements lance l\'action de nombreuses fois.', ref: [209] },
    { html: 'Les playbooks lancés par les règles doivent être idempotents, car un événement peut arriver deux fois ; la logique reste dans les playbooks, les règles ne font que décider.', ref: [219] }
  ]
});
