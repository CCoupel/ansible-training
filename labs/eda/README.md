# Lab: webhook → remediation (Event-Driven Ansible)

An event arrives on a local webhook; a rule reacts and runs a playbook that **simulates** the restart of a service.
Nothing real is restarted: the playbook only prints a message and writes a marker file in `/tmp`.

## Prerequisites

- Java 17 or later (required by `ansible-rulebook`): `java -version`
- `ansible-rulebook`, `ansible` and `ansible-runner`: `pip install ansible-rulebook ansible ansible-runner` (the installation page of the Ansible Rulebook documentation lists exactly these three packages)
- The `ansible.eda` collection: `ansible-galaxy collection install ansible.eda`
- `curl`
- TCP port 5000 free on 127.0.0.1 (the webhook listens on this address only)

## Statement

1. Write a rulebook with a `ansible.eda.webhook` source listening on `127.0.0.1`, port `5000`.
2. Add a rule that fires when `event.payload.status` equals `"down"` and runs the playbook `remediate.yml`.
3. Write `remediate.yml`: it prints a message naming the service received in the event (`ansible_eda.event.payload.service`, inserted in the playbook by the rulebook engine), then leaves a marker file `/tmp/eda-lab-my_service.txt` (simulated restart).
4. Start the rulebook, then send events with `curl` from a second terminal.

The inventory `inventory.yml` only contains `localhost`.

## Run

Solution files are in `solution/` (try the statement first):

```
cd solution
ansible-rulebook -r rulebook.yml -i ../inventory.yml --verbose
```

In a second terminal, send an event that must trigger the rule:

```
curl -H 'Content-Type: application/json' -d '{"service": "my_service", "status": "down"}' http://127.0.0.1:5000/endpoint
```

Then an event that must not trigger anything:

```
curl -H 'Content-Type: application/json' -d '{"service": "my_service", "status": "up"}' http://127.0.0.1:5000/endpoint
```

## Expected result

- First event: `curl` answers with HTTP 200, the rule `Restart the simulated service` fires, `remediate.yml` runs, the
  message `Simulated restart of my_service` is displayed and the file `/tmp/eda-lab-my_service.txt` exists.
- Second event: HTTP 200 but no rule fires and no playbook runs.

## Clean up

Stop the rulebook with Ctrl+C (the port is released), then remove the marker file:

```
rm -f /tmp/eda-lab-my_service.txt
```

## Sources checked

Read on 2026-10-08 in the official `ansible/ansible-rulebook` repository (documentation sources, `main` branch), because
the rendered pages of docs.ansible.com answered HTTP 429:

- `docs/installation.rst`: Java development kit 17 or later; `pip install ansible-rulebook ansible ansible-runner`; the
  `ansible.eda` collection (installation instructions in https://github.com/ansible/event-driven-ansible#install,
  `ansible-galaxy collection install ansible.eda`).
- `docs/variables.rst`: the rulebook engine inserts `event` (single match), `ruleset` and `rule` under the top level key
  `ansible_eda` in the playbook (`{{ ansible_eda.event }}`); `extra_vars` of `run_playbook` also exist but are not used here.
- `docs/actions.rst`: `run_playbook` and its `name` option.
- `ansible.eda.webhook` options `host` and `port`: plugin `webhook.py` of `ansible/event-driven-ansible`.
- Rendered documentation: https://docs.ansible.com/projects/rulebook/ (getting started: `-r`, `-i`, `--verbose`, `curl`
  to 127.0.0.1:5000).

Not checked: the lab has not been executed (Java and `ansible-rulebook` are not installed on the authoring workstation);
the field `payload.service` is the one sent by the `curl` commands above. The automated tests only check the structure
of the YAML files. Play the lab on a workstation with the prerequisites, with `tests/procedures/labs/eda/lab-teste.md`.
