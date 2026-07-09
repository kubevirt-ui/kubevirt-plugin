# Manual Console (CNV-92150)

Deploys a standalone, OAuth-protected OpenShift console + kubevirt-plugin
stack on an existing hot cluster, for manually testing branch UI code
against a real CNV environment. Complements the [E2E test stack](../hot-cluster/ci-env/README.md)
without modifying it: manual-console reuses the same `ci-env-controller` and
`ci-test-stack` Helm chart, but through its own trigger label, ConfigMap
fields, and namespace, so it has zero effect on E2E behavior.

## Why not just use the E2E console?

The E2E test stack is ephemeral (torn down after every run), namespaced per
CI run, and runs with `BRIDGE_USER_AUTH=disabled` (a bearer token, no login
wall) -- suitable for automated Playwright tests, not for a human to browse.
Manual-console is the same underlying stack with three differences:

| | E2E | Manual console |
| - | --- | --------------- |
| Namespace | Ephemeral `kubevirt-plugin-ci-test-<run_id>` | Persistent `manual-console` |
| Lifecycle | Torn down after the test run; 2h TTL reaper | Persists until the next deploy; **not** TTL-reaped |
| Auth | `BRIDGE_USER_AUTH=disabled` (bearer token) | `BRIDGE_USER_AUTH=openshift` (OAuth login) |
| Plugin image | Built on `ubuntu-latest`, pushed to `ttl.sh` | Built in-cluster via an OpenShift BuildConfig |

## Prerequisites

The target cluster must already be provisioned via **IBM Cloud Hot Cluster
Setup** ([`ibmc-cluster-setup.yml`](../../.github/workflows/ibmc-cluster-setup.yml)),
which installs the ARC runner scale set and `ci-env-controller` this
workflow depends on.

## Deploying

Actions -> **Deploy Manual Console** -> Run workflow, with:

- `branch` -- the branch to build the plugin image from
- `cluster_name` -- the ARC runner label / hot cluster name (default `kubevirt-plugin-ci`)
- `infrastructure_type` -- informational only, no kubeconfig is downloaded

For UI-only iteration afterwards, **Deploy Plugin** rebuilds and
redeploys just the plugin image against the same release.

## How it works

```
ARC runner (deploy-manual-console.yml)     ci-env namespace              manual-console namespace
+-----------------------------+     +------------------------+    +--------------------+
| setup-plugin-image.sh       |     |                        |    |                    |
|  -> in-cluster BuildConfig   |     | ci-env-controller      |    | console Deployment |
| generate password (openssl) |---->| (watches ConfigMaps    |--->| plugin Deployment  |
| create short-lived Secret   |     |  labeled manual-console)|   | OAuthClient, Route |
| create/update ConfigMap     |     |                        |    |                    |
+-----------------------------+     +------------------------+    +--------------------+
      |                                       |
      |  poll status=ready                    |  reads password Secret, upserts
      |<--------------------------------------+  htpasswd user, deletes Secret,
      |                                          runs helm upgrade, patches
      v                                          ConfigMap with console-route
  Slack: URL + username + password
```

No kubeconfig is ever downloaded or uploaded as an artifact: every step runs
on the ARC runner (an in-cluster pod, authenticated via its mounted
ServiceAccount token), the same model already used by
[hot-cluster-e2e-run.yml](../../.github/workflows/hot-cluster-e2e-run.yml).

## Credentials

Unlike the cluster-setup Slack notification (which uses either the IPI
`kubeadmin` password or the `CLUSTER_ADMIN_PASSWORD` secret), manual-console
credentials are generated fresh on every deploy -- no GitHub secret is
required beyond `SLACK_WEBHOOK_URL`:

1. The workflow generates a random password (`openssl rand -base64 24`) and
   masks it in the logs.
2. It writes that password into a short-lived Kubernetes `Secret` in the
   `ci-env` namespace (never into the trigger ConfigMap).
3. `ci-env-controller` reads the Secret, upserts an htpasswd identity
   provider user named `manual-console` with that password, grants it
   `cluster-admin`, and **deletes the Secret immediately** -- the password
   never persists in the cluster.
4. The workflow posts the console URL, username, and password to Slack
   (`SLACK_WEBHOOK_URL`), along with the GitHub user who triggered the
   deploy and a link to the run.

Redeploying (either workflow) rotates the password; the previous one stops
working. **Deploy Plugin** sends its own Slack reminder for this reason.

If `SLACK_WEBHOOK_URL` isn't configured, the workflow logs a warning and
skips notification -- the deploy still succeeds, but credentials must be
retrieved by watching the workflow logs (masked) or re-running with the
webhook configured.

## ConfigMap contract additions

`ci-env-controller` treats these fields as strictly optional; any E2E
ConfigMap that omits them (i.e. every existing one) behaves exactly as
before. See [`ci-env/README.md`](../hot-cluster/ci-env/README.md) for the
base contract.

| Field | Description |
| ----- | ------------ |
| `auth-mode` | `openshift` to enable OAuth login; omitted/anything else keeps the default disabled (bearer-token) behavior |
| `htpasswd-user` | Username to upsert into the cluster's htpasswd identity provider (required when `auth-mode=openshift`) |
| `htpasswd-secret-name` | Name of a Secret (in the same `ci-env-namespace`) with key `password`; read once and deleted by the controller |

The manual-console ConfigMap also uses the label
`ci.kubevirt-plugin/type: manual-console` instead of `test-environment`, so
it is reconciled by the same controller loop but **exempt from the 2-hour
TTL reaper** that force-cleans stale E2E environments.

## Isolation from E2E and the CNV console

- Separate namespace (`manual-console`) from every E2E test namespace.
- No patches to `openshift-console`, HCO, SSP, or any CNV operator.
- The CNV-bundled console at the cluster's normal console URL is untouched.
- Running `hot-cluster-e2e.yml` on the same cluster provisions its own
  ephemeral namespace independently; the two do not interact.

## Files

| File | Purpose |
| ---- | ------- |
| `images/setup-plugin-image.sh` | Builds the kubevirt-plugin image in-cluster via an OpenShift BuildConfig |
| `ensure-manual-console-user.sh` | Upserts the htpasswd user + extracts the cluster CA bundle; invoked by `ci-env-controller` (embedded into its image -- see below) |

`ensure-manual-console-user.sh` is embedded into the `ci-env-runner` image at
build time (via a symlink in
[`../hot-cluster/images/ci-env-runner/`](../hot-cluster/images/ci-env-runner/),
the same mechanism already used for the `ci-test-stack` Helm chart). If this
script changes, the cluster's `ci-env-controller` must be reinstalled to
pick up the new image:

```bash
./ci-scripts/hot-cluster/ci-env/install-ci-env-controller.sh
```

Until that reinstall happens, the cluster's existing `ci-env-controller`
keeps running its old image -- E2E is unaffected either way, since it never
sets `auth-mode`.
