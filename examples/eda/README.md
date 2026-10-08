# Event-Driven Ansible: examples

Ten small rulebooks, all listening on a **local** webhook (`127.0.0.1:5000`) or on a built-in test source. The YAML of
`01` to `09` is the one shown on the slides of the module *Event-Driven Ansible* (slides noted in each file header): the
files and the slides must stay identical. `10` and `remediate.yml` are the same as the lab solution (`labs/eda/solution/`).

| File | Topic | Slide |
|---|---|---|
| `01-first-rulebook.yml` | Webhook → `debug` (first rulebook) | 199 |
| `02-webhook-token.yml` | Webhook with a Bearer token (demo value) | 201 |
| `03-generic-source.yml` | `generic` source and `json_filter`, no network | 202 |
| `04-conditions-basics.yml` | Basics of a condition | 204 |
| `05-operators.yml` | Comparison, `and`, `in`, `contains`, `is defined` | 205 |
| `06-strings-lists.yml` | `is match`, `is search`, `is regex`, `is selectattr` | 206 |
| `07-several-events.yml` | `all` (with `timeout`) and `any` | 207 |
| `08-facts-variables.yml` | `set_fact`, `vars.`, `--vars`, `--env-vars` | 208 |
| `09-throttle.yml` | `throttle`: `once_within`, `group_by_attributes` | 209 |
| `10-run-playbook.yml` + `remediate.yml` | Webhook → `run_playbook` (simulated restart) | lab |

`inventory.yml` (localhost) is shared by all examples; `vars.yml` is used by `08`.

## Prerequisites

- Java 17 or later, `ansible-rulebook` and `ansible-core`: `pip install ansible-rulebook ansible-core`
- The `ansible.eda` collection: `ansible-galaxy collection install ansible.eda`
- `curl`; TCP port 5000 free on 127.0.0.1

## Run an example

```
ansible-rulebook -r 01-first-rulebook.yml -i inventory.yml --verbose
```

In a second terminal, send the event suggested in the header comment of the file, for example:

```
curl -X POST -H "Content-Type: application/json" -d '{"status": "down"}' http://127.0.0.1:5000/alert
```

Stop with Ctrl+C before starting another example (they all use port 5000). `03-generic-source.yml` needs no `curl`:
the rulebook ends when its source has sent all its events. Example `08` is started with
`MY_NAME="Bob" ansible-rulebook -r 08-facts-variables.yml -i inventory.yml --vars vars.yml --env-vars MY_NAME`.
`10` writes a marker file `/tmp/eda-lab-my_service.txt` (remove it afterwards).

These examples follow the official Ansible Rulebook documentation (https://docs.ansible.com/projects/rulebook/); they have
to be played on a workstation with Java and `ansible-rulebook`, they are not run by the automated tests.
