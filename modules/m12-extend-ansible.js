/* Module 12 — Extend Ansible (slides PPTX 162 à 182). Conversion verbatim : le texte des slides n'est pas reformulé.
   Contenu additionnel (objectifs, À retenir, quiz) : dérivé uniquement de ces slides, voir `ref`. */
COURSE.add({
  id: 'm12', num: 12, emoji: '🛠️',
  title: 'Extend Ansible',
  tagline: 'Piloter l\'exécution avec les stratégies, étendre Ansible avec des plugins et écrire un module.',
  tagline_en: 'Control execution with strategies, extend Ansible with plugins and write a module.',
  objectives: [
    { html: 'Décrire les stratégies d\'exécution : <code>linear</code> (par défaut), <code>free</code> et host-pinned.', html_en: 'Describe the execution strategies: <code>linear</code> (default), <code>free</code> and host-pinned.', ref: [163, 164] },
    { html: 'Contrôler l\'exécution avec <code>serial</code>, <code>throttle</code> et <code>run_once</code>.', html_en: 'Control execution with <code>serial</code>, <code>throttle</code> and <code>run_once</code>.', ref: [165, 166] },
    { html: 'Citer les types de plugins : connexion, callback, inventaire, lookup, vars et filtres.', html_en: 'List the plugin types: connection, callback, inventory, lookup, vars and filters.', ref: [168, 169] },
    { html: 'Expliquer le rôle d\'un callback : réagir aux événements de l\'exécution d\'un playbook.', html_en: 'Explain the role of a callback: reacting to the events of a playbook run.', ref: [170] },
    { html: 'Décrire les étapes d\'un module personnalisé : déclarer les entrées, lire les paramètres, retourner les valeurs.', html_en: 'Describe the steps of a custom module: declare the inputs, read the parameters, return the values.', ref: [175, 176, 177] }
  ],
  slides: [
    { title: 'Strategie:', src: [162],
      blocks: [
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_strategies.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_strategies.html</a>' }
      ] },
    { title: 'What are Ansible Strategies?', src: [163],
      blocks: [
        { t: 'bullets', items: ['define how tasks are executed across multiple hosts. They control the flow and behavior of task execution.', 'Purpose of Strategies:<ul><li>Optimize the execution of playbooks to meet different operational requirements and improve efficiency.</li></ul>', 'Key Strategies:<ul><li>Linear Strategy:<ul><li>The default strategy where tasks are executed in a linear fashion, one after the other, across all hosts.</li></ul></li><li>Free Strategy:<ul><li>Allows tasks to run independently on each host, without waiting for other hosts to complete the same task.</li></ul></li><li>Host-pinned Strategy:<ul><li>Ensures that tasks are executed on a per-host basis, maintaining the order of tasks for each host.</li></ul></li></ul>', 'Why Use Different Strategies?<ul><li>Performance Optimization: Choose the best strategy to optimize the performance of your playbooks based on the specific needs of your environment.</li><li>Flexibility: Adapt the execution flow to handle different scenarios, such as high-latency networks or resource-constrained environments.</li><li>Control: Gain finer control over how tasks are executed, improving the reliability and predictability of your automation processes.</li></ul>'] }
      ] },
    { title: 'Strategies: Control Playbook Execution', src: [164],
      blocks: [
        { t: 'bullets', items: ['Linear: Default: runs each task on all hosts before starting the next task on any host<ul><li>Stops when a task fails</li></ul>', 'Free: allows each host to run until the end of the play<ul><li>Stops when a host fails</li></ul>'] },
        { t: 'code', lang: 'yaml', code: `- hosts: all
  strategy: free
  Tasks:
….` }
      ] },
    { title: 'Strategies: Control Playbook Execution (serial)', src: [165],
      blocks: [
        { t: 'bullets', items: ['Serial: Do all tasks for a subset of hosts before next subset<ul><li>Stops when a subset fails</li></ul>'] },
        { t: 'code', lang: 'yaml', code: `- name: test play
  hosts: webservers
  serial:
  - 1
  - 5
  - "20%"` }
      ] },
    { title: 'Strategies: Control Task Execution', src: [166],
      blocks: [
        { t: 'bullets', items: ['Throttle: Limit the parallel servers execution<ul><li>Stops when a task fails</li></ul>'] },
        { t: 'code', lang: 'yaml', code: `- name: test task
  command: /path/to/cpu_intensive_command
  throttle: 1
Run_Once: The task is run only on the FIRST host of the batch` },
        { t: 'bullets', items: ['			Stops when a task fails<ul><li>- name: test task</li></ul>'] },
        { t: 'code', lang: 'yaml', code: `  command: /path/to/cpu_intensive_command
  run_once: true` }
      ] },
    { title: 'What Does Extending Ansible Mean?', src: [167],
      blocks: [
        { t: 'bullets', items: ['involves adding custom functionality to Ansible through modules, plugins, and collections.', 'Purpose of Extending Ansible:<ul><li>Enhance Ansible’s capabilities to meet specific needs and integrate with various systems and workflows.</li></ul>', 'Key Methods to Extend Ansible:<ul><li>Custom Modules:<ul><li>Create new modules to perform specific tasks that are not covered by existing modules.</li><li>Modules can be written in any language, though Python is commonly used.</li></ul></li><li>Plugins:<ul><li>Action Plugins: Extend the behavior of modules.</li><li>Callback Plugins: Hook into Ansible events for logging or custom actions.</li><li>Connection Plugins: Define how to communicate with inventory hosts.</li><li>Filter Plugins: Manipulate data within playbooks and templates.</li><li>Lookup Plugins: Retrieve data from external sources.</li></ul></li><li>Collections:<ul><li>Package and distribute modules, plugins, roles, and playbooks together.</li><li>Share collections via Ansible Galaxy or internally within your organization.</li></ul></li></ul>', 'Why Extend Ansible?<ul><li>Customization: Tailor Ansible to fit unique requirements and environments.</li><li>Integration: Seamlessly integrate with other tools and systems.</li><li>Efficiency: Automate complex tasks and workflows that are specific to your needs.</li></ul>'] }
      ] },
    { title: 'Extend Ansible', src: [168],
      blocks: [
        { t: 'text', html: '<b>- Connection plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/connection.html#plugin-list" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/connection.html#plugin-list</a>' },
        { t: 'text', html: 'Connection plugins allow Ansible to connect to the target hosts so it can execute tasks on them' },
        { t: 'text', html: 'Ex: ssh, local, winrm, docker, paramiko ...' },
        { t: 'text', html: '<b>- Callback plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/callback.html#plugin-list" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/callback.html#plugin-list</a>' },
        { t: 'text', html: 'Callback plugins enable adding new behaviors to Ansible when responding to events' },
        { t: 'text', html: '<b>- Inventory plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/inventory.html#inventory-plugins" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/inventory.html#inventory-plugins</a>' },
        { t: 'text', html: 'Inventory plugins are invoked via the InventoryManager and are given access to any existing inventory data' },
        { t: 'text', html: 'Ex: openstack, openshift, vmware, ...' }
      ] },
    { title: 'Extend Ansible (2/2)', src: [169],
      blocks: [
        { t: 'text', html: '<b>- Lookup plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/lookup.html#lookup-plugins" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/lookup.html#lookup-plugins</a>' },
        { t: 'text', html: 'Lookup plugins are used to pull in data from external data stores' },
        { t: 'text', html: 'Ex: file, hiera, csvfile, nested, items, ...' },
        { t: 'text', html: '<b>- vars plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/vars.html#vars-plugins" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/vars.html#vars-plugins</a>' },
        { t: 'text', html: 'Vars plugins inject additional variable data into Ansible runs that did not come from' },
        { t: 'text', html: 'an inventory source, playbook, or command line' },
        { t: 'text', html: 'Ex: host_group_vars' },
        { t: 'text', html: '<b>- filter plugins</b>' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/plugins/filter.html#filter-plugins" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/plugins/filter.html#filter-plugins</a>' },
        { t: 'text', html: 'Filter plugins are used for manipulating data' },
        { t: 'text', html: 'Ex: ipaddr, urlsplit, network, ...' },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/module_plugin_guide/index.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/module_plugin_guide/index.html</a>' }
      ] },
    { title: 'What are Ansible Callbacks?', src: [170],
      blocks: [
        { t: 'bullets', items: ['plugins that allow you to hook into various stages of the Ansible execution process to perform custom actions.', 'Purpose of Callbacks:<ul><li>Enhance the functionality of Ansible by adding custom behaviors, logging, notifications, and more.</li></ul>', 'Key Features:<ul><li>Event Handling:<ul><li>triggered by specific events during playbook execution, such as task start, task end, playbook start, and playbook end.</li></ul></li><li>Custom Actions:<ul><li>Perform custom actions like sending notifications, logging to external systems, or modifying the output format.</li></ul></li><li>Built-in Callbacks:<ul><li>Ansible includes several built-in callback plugins for common tasks like logging, profiling, and sending email notifications.</li></ul></li></ul>', 'Why Use Callbacks?<ul><li>Customization: Tailor the behavior of Ansible to meet specific requirements and workflows.</li><li>Monitoring: Improve monitoring and visibility of playbook executions by integrating with external logging and monitoring systems.</li><li>Automation: Automate responses to specific events, such as sending alerts or updating dashboards.</li></ul>'] }
      ] },
    { title: 'Call Back', src: [171],
      blocks: [
        { t: 'text', html: 'Change how ansible handle playbook events:' },
        { t: 'text', html: '- in callback_plugins folder of playbook or role' },
        { t: 'text', html: '- in folder of ansible.cfg' }
      ] },
    { title: 'Callback events', src: [172],
      blocks: [
        { t: 'code', lang: 'python', code: `def v2_on_any(self, *args, **kwargs):
def v2_runner_on_failed(self, result, ignore_errors=False):
def v2_runner_on_ok(self, result):
def v2_runner_on_skipped(self, result):
def v2_runner_on_unreachable(self, result):
def v2_runner_on_async_poll(self, result):
def v2_runner_on_async_ok(self, result):
def v2_runner_on_async_failed(self, result):
def v2_playbook_on_start(self, playbook):
def v2_playbook_on_notify(self, handler, host):
def v2_playbook_on_no_hosts_matched(self):
def v2_playbook_on_no_hosts_remaining(self):
def v2_playbook_on_task_start(self, task, is_conditional):
def v2_playbook_on_handler_task_start(self, task):
def v2_playbook_on_vars_prompt(self, varname, private=True, prompt=None, encrypt=None, confirm=False, salt_size=None, salt=None, default=None, unsafe=None):
def v2_playbook_on_play_start(self, play):
def v2_playbook_on_stats(self, stats):
def v2_playbook_on_include(self, included_file):
def v2_runner_item_on_ok(self, result):
def v2_runner_item_on_failed(self, result):
def v2_runner_retry(self, result):` }
      ] },
    { title: 'What is a Custom Module?', src: [173],
      blocks: [
        { t: 'bullets', items: ['A custom module is a reusable, self-contained piece of code that extends Ansible\'s functionality to perform a specific task or set of tasks.', 'Purpose of Custom Modules:<ul><li>Custom modules allow you to write your own logic to interact with your infrastructure, applications, or services, and integrate it seamlessly with Ansible playbooks.</li></ul>', 'Key Features:<ul><li>Modular code: Write reusable, modular code that can be easily maintained and updated.</li><li>Flexibility: Create custom modules in any language, including Python, PowerShell, or Bash.</li><li>Integration: Integrate custom modules with Ansible playbooks to automate complex tasks and workflows.</li></ul>', 'Why Use Custom Modules with Ansible?<ul><li>Extensibility: Extend Ansible\'s capabilities to support custom infrastructure, applications, or services.</li><li>Reusability: Write once, use many times - custom modules can be reused across multiple playbooks and environments.</li><li>Efficiency: Automate complex tasks and workflows with custom modules, reducing the need for manual intervention.</li></ul>'] }
      ] },
    { title: 'Module', src: [174],
      blocks: [
        { t: 'text', html: 'Write a module that waits for an incoming network connection and echoes all received data :' },
        { t: 'code', lang: 'text', code: `"BindIP": default=0.0.0.0
"Port": required
"Protocol": default="tcp",['tcp', 'udp','http']` },
        { t: 'text', html: '<a href="https://docs.ansible.com/projects/ansible/latest/dev_guide/developing_modules_general.html" target="_blank" rel="noopener">https://docs.ansible.com/projects/ansible/latest/dev_guide/developing_modules_general.html</a>' },
        { t: 'text', html: '<a href="https://example.com/repo/checknetwork-playbook" target="_blank" rel="noopener">https://example.com/repo/checknetwork-playbook</a>' }
      ] },
    { title: 'Module: Declare inputs constraintes', src: [175],
      blocks: [
        { t: 'code', lang: 'python', code: `  fields = {
    "BindIP": {"default": "0.0.0.0", "type": "str"},
    "Port": {"required": True, "type": "int"},
    "Protocol": {
      "default": "tcp",
      "choices": ['tcp', 'udp','http'],
      "type": 'str',
    },
  }

  module = AnsibleModule(argument_spec=fields)` }
      ] },
    { title: 'Module: Retreive inputs values', src: [176],
      blocks: [
        { t: 'code', lang: 'python', code: `  IP = module.params["BindIP"]
  PORT = module.params["Port"]
  PROTO=module.params["Protocol"]` }
      ] },
    { title: 'Module: Do and Return values', src: [177],
      blocks: [
        { t: 'code', lang: 'python', code: `  Result, data, msg=do_something(IP,PORT, PROTO)

  module.exit_json(changed=False,failed=result, stderr=str(msg), stdout=str(data), my_data="data") )` }
      ] },
    { title: 'Module: All In One (1/2)', src: [178],
      blocks: [
        { t: 'code', lang: 'python', code: `#!/usr/bin/python
import sys, socket
from ansible.module_utils.basic import *

def main():
  fields = {
    "BindIP": {"default": "0.0.0.0", "type": "str"},
    "Port": {"required": True, "type": "int"},
    "Protocol": {
    "default": "tcp",
    "choices": ['tcp', 'udp','http'],
    "type": 'str',
    },
  }
  module = AnsibleModule(argument_spec=fields)

  result=False
  IP = module.params["BindIP"]
  PORT = module.params["Port"]
  PROTO=module.params["Protocol"]

 Result, data, msg=do_something(IP,PORT, PROTO)
  module.exit_json(changed=False,failed=result, stderr=str(msg), stdout=str(data) )

if __name__ == '__main__':
main()` }
      ] },
    { title: 'Module: All In One (2/2)', src: [179],
      blocks: [
        { t: 'text', html: '<b>import socket</b>' },
        { t: 'text', html: '<b>BUFFER_SIZE = 1024</b>' },
        { t: 'code', lang: 'python', code: `def do_something(IP, PORT, PROTO) :
 if PROTO.upper() == "TCP":
      result, data, msg=TCP(IP, PORT)
def TCP(IP, PORT) :
  data=""
  tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
  try:
    tcp.bind((IP, PORT))
  except socket.error as msg:
    print("Couldnt connect with the socket-server: %s\\n terminating program" % msg)
    return True,"",msg
  tcp.listen(1)
  conn, addr = tcp.accept()
  print('Connection address:', addr)
  while len(data) == 0:
    Failed=False
    data = conn.recv(BUFFER_SIZE)
    if not data: break
    print("received TCP data:", data)
    conn.send(data) # echo
  conn.close()
  return False,data, ""` }
      ] },
    { title: 'Module: Call', src: [180],
      blocks: [
        { t: 'code', lang: 'yaml', code: `- name: Mon module
    Mon_Module:
       BindIP="{{Flux.SRC}}"
       Port="{{Flux.Port}}"
       Protocol="{{Flux.Proto}} "
    register: MyData` }
      ] },
    { title: 'Module: Exercise', src: [181, 182],
      blocks: [
        { t: 'lab', title: 'Exercice:', steps: ['Write a module ‘REPLACEinFile’ :<br>- return changed=true if a replace was success<br>- return changed=false if no replace was done<br>- return failed=true if replacement is not successfull', '3 parameters:<br>- find<br>- replace<br>- file'] },
        { t: 'reveal', slide: 182, html: '<pre># File: library/replace_in_file.py\nimport os\ndef main():\n    module = AnsibleModule(\n        argument_spec=dict(\n            find=dict(required=True, type=\'str\'),\n            replace=dict(required=True, type=\'str\'),\n            file=dict(required=True, type=\'str\')\n        )\n    )\n    find = module.params[\'find\']\n    replace = module.params[\'replace\']\n    file_path = module.params[\'file\']\n    if not os.path.exists(file_path):\n        module.fail_json(msg=f"File {file_path} does not exist")\n    with open(file_path, \'r\') as f:\n        content = f.read()\n    if find not in content:\n        module.exit_json(changed=False)\n    new_content = content.replace(find, replace)\n    if new_content == content:\n        module.exit_json(changed=False)\n    with open(file_path, \'w\') as f:\n        f.write(new_content)\n    module.exit_json(changed=True)\nif __name__ == \'__main__\':\n    main()\n---\n- name: Replace string in file\n  replace_in_file:\n    find: \'old_string\'\n    replace: \'new_string\'\n    file: \'/path/to/file.txt\'</pre>' }
      ] },
    { title: 'Quiz 1', title_en: 'Quiz 1', extra: true, blocks: [
      { t: 'quiz', q: 'Quelle stratégie d\'exécution est la stratégie par défaut ?', q_en: 'Which execution strategy is the default one?',
        options: ['Free', 'Host-pinned', 'Linear'],
        options_en: ['Free', 'Host-pinned', 'Linear'], answer: 2,
        explain: 'Slide 163 : « Linear Strategy: The default strategy where tasks are executed in a linear fashion, one after the other, across all hosts ».',
        explain_en: 'Slide 163: “Linear Strategy: The default strategy where tasks are executed in a linear fashion, one after the other, across all hosts”.', ref: [163] }
    ] },
    { title: 'Quiz 2', title_en: 'Quiz 2', extra: true, blocks: [
      { t: 'quiz', q: 'Que fait <code>run_once</code> ?', q_en: 'What does <code>run_once</code> do?',
        options: ['La tâche est exécutée sur tous les hôtes en parallèle', 'La tâche n\'est exécutée que sur le premier hôte du lot', 'La tâche n\'est exécutée qu\'une fois par jour'],
        options_en: ['The task runs on all hosts in parallel', 'The task runs only on the first host of the batch', 'The task runs only once a day, and no more often'], answer: 1,
        explain: 'Slide 166 : « Run_Once: The task is run only on the FIRST host of the batch ».',
        explain_en: 'Slide 166: “Run_Once: The task is run only on the FIRST host of the batch”.', ref: [166] }
    ] },
    { title: 'Quiz 3', title_en: 'Quiz 3', extra: true, blocks: [
      { t: 'quiz', q: 'Dans l\'exemple de la slide 177, quelle méthode retourne les valeurs du module ?', q_en: 'In the example on slide 177, which method returns the module values?',
        options: ['module.exit_json', 'module.params', 'module.argument_spec'],
        options_en: ['module.exit_json', 'module.params', 'module.argument_spec'], answer: 0,
        explain: 'La slide 177 appelle <code>module.exit_json</code> avec <code>changed</code>, <code>stderr</code> et <code>stdout</code> ; <code>module.params</code> sert à lire les entrées (slide 176).',
        explain_en: 'Slide 177 calls <code>module.exit_json</code> with <code>changed</code>, <code>stderr</code> and <code>stdout</code>; <code>module.params</code> is used to read the inputs (slide 176).', ref: [176, 177] }
    ] }
  ],
  takeaways: [
    { html: 'La stratégie <code>linear</code> est la stratégie par défaut : chaque tâche s\'exécute sur tous les hôtes avant de passer à la suivante.', html_en: 'The <code>linear</code> strategy is the default: each task runs on all hosts before moving on to the next.', ref: [163, 164] },
    { html: 'La stratégie <code>free</code> laisse chaque hôte exécuter le play jusqu\'au bout sans attendre les autres.', html_en: 'The <code>free</code> strategy lets each host run the play to the end without waiting for the others.', ref: [164] },
    { html: '<code>serial</code> traite un sous-ensemble d\'hôtes à la fois ; <code>throttle</code> limite le parallélisme d\'une tâche ; <code>run_once</code> n\'exécute la tâche que sur le premier hôte du lot.', html_en: '<code>serial</code> processes a subset of hosts at a time; <code>throttle</code> limits the parallelism of a task; <code>run_once</code> runs the task only on the first host of the batch.', ref: [165, 166] },
    { html: 'Les plugins étendent Ansible : connexion, callback, inventaire, lookup, vars et filtres.', html_en: 'Plugins extend Ansible: connection, callback, inventory, lookup, vars and filters.', ref: [168, 169] },
    { html: 'Un callback se branche sur des événements comme le début ou la fin d\'une tâche ou d\'un playbook.', html_en: 'A callback hooks into events such as the start or the end of a task or a playbook.', ref: [170] },
    { html: 'Un module personnalisé peut être écrit dans n\'importe quel langage (Python est courant) ; il déclare ses paramètres avec <code>AnsibleModule</code> et retourne ses résultats avec <code>exit_json</code>.', html_en: 'A custom module can be written in any language (Python is common); it declares its parameters with <code>AnsibleModule</code> and returns its results with <code>exit_json</code>.', ref: [167, 175, 177] }
  ]
});
