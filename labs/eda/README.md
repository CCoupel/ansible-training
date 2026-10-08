# Lab: webhook → remediation (Event-Driven Ansible)

An event arrives on a local webhook; a rule reacts and runs a playbook that **simulates** the restart of a service.
Nothing real is restarted: the playbook only prints a message and writes a marker file in `/tmp`.

## Prerequisites

- Java 17 or later (required by `ansible-rulebook`): `java -version`
- `ansible-rulebook` and `ansible-core`: `pip install ansible-rulebook ansible-core`
- The `ansible.eda` collection: `ansible-galaxy collection install ansible.eda`
- `curl`
- TCP port 5000 free on 127.0.0.1 (the webhook listens on this address only)

## Statement

1. Write a rulebook with a `ansible.eda.webhook` source listening on `127.0.0.1`, port `5000`.
2. Add a rule that fires when `event.payload.status` equals `"down"` and runs the playbook `remediate.yml`.
3. Write `remediate.yml`: it prints a message, then leaves a marker file `/tmp/eda-lab-my_service.txt` (simulated restart).
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

`ansible.eda.webhook` options (`host`, `port`), `condition` on `event.payload`, `run_playbook` with a relative playbook
name (relative to the directory where `ansible-rulebook` runs) and the options `-r`, `-i`, `--verbose` follow the
official Ansible Rulebook documentation (https://docs.ansible.com/projects/rulebook/). The lab itself must be played on
a workstation with Java and `ansible-rulebook`; it is not run by the automated tests.
