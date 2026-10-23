# Manual Console

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

|              | E2E                                           | Manual console                                                                                                                      |
| ------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Namespace    | Ephemeral `kubevirt-plugin-ci-test-<run_id>`  | Persistent `manual-console`                                                                                                         |
| Lifecycle    | Torn down after the test run; 2h TTL reaper   | Persists until the next deploy; **not** TTL-reaped                                                                                  |
| Auth         | `BRIDGE_USER_AUTH=disabled` (bearer token)    | `openshift` (HTPasswd OAuth) when the cluster allows it; falls back to `disabled` on VPC ROKS where the guest OAuth CR is immutable |
| Plugin image | Built on `ubuntu-latest`, pushed to `quay.io` | Built in-cluster via an OpenShift BuildConfig                                                                                       |

## Prerequisites

The target cluster must already be provisioned via **IBM Cloud Hot Cluster
Setup** ([`ibmc-cluster-setup.yml`](../../.github/workflows/ibmc-cluster-setup.yml)),
which installs the ARC runner scale set and `ci-env-controller` this
workflow depends on.

The ARC runner's ServiceAccount also needs permission to manage
ImageStreams/BuildConfigs inside the `manual-console` namespace so it can
build the plugin image and delete those objects on
`/cleanup-manual-console` (see "How it works" / "Tearing down" below).
This is a one-time, per-cluster bootstrap -- `arc-runner-rbac.yaml`
intentionally keeps that permission out of the cluster-wide E2E RBAC, so
it's granted separately and scoped to just this namespace:

```bash
./ci-scripts/manual-console/install-manual-console-rbac.sh
```

Re-run the same script after Role changes (e.g. adding `delete`) so
existing clusters pick up the updated verbs. Set
`RUNNER_SCALE_SET_NAME` / `ARC_RUNNERS_NS` first if your cluster uses a
custom runner scale set name (see [`arc/README.md`](../hot-cluster/arc/README.md))
-- the script substitutes the `ServiceAccount` subject in
`manual-console-rbac.yaml` for you (default `kubevirt-plugin-ci`, e.g.
`RUNNER_SCALE_SET_NAME=kubevirt-plugin-420` for that release cluster). Do
not `oc apply -f manual-console-rbac.yaml` directly unless your runner
scale set is actually named `kubevirt-plugin-ci` -- the raw manifest's
subject never matches a release cluster's runner SA.

## Deploying

Actions -> **Deploy Manual Console** -> Run workflow, with:

- `branch` -- the branch to build the plugin image from (ignored if `pr_number` is set)
- `pr_number` -- deploy a PR instead, or comment `/deploy-manual-console` on it
- `cluster_name` -- optional ARC runner label / hot cluster name. Leave empty
  to use the same cluster E2E would: when `pr_number` is set, resolve from that
  PR's base ref and ignore `branch`; otherwise resolve from `branch`
  (`release-X.Y` → `kubevirt-plugin-XY`, else `kubevirt-plugin-ci`). Prefer
  leaving it empty so deploys land on the shared release/CI cluster instead of
  provisioning a new one under a typo'd name. Check the recorded target on the
  PR (or the run's resolve-config output) before redeploy/teardown.
- `infrastructure_type` -- used only if the target cluster is not already up
  (cluster-check will provision it)

Slash commands omit the cluster by default: `/deploy-manual-console`
resolves from the PR base and records the target on the PR;
`/cleanup-manual-console` uses the newest deploy record (not the PR base or
run-name brackets). Pass an explicit name only for a different cluster
(`/deploy-manual-console my-cluster`), or when cleanup cannot find a prior
deploy (`/cleanup-manual-console <cluster-name>`).

For UI-only iteration afterwards, **Deploy Plugin** rebuilds and redeploys
just the plugin image against the same instance -- it takes the same
`branch`/`pr_number` inputs (and the same optional `cluster_name` defaulting)
and must be given the same one used for the original deploy, or it targets a
different (and possibly nonexistent) instance.

Every deploy is scoped to an **instance key** -- `pr-<number>` when
`pr_number` is set, otherwise a truncated, normalized `branch` prefix plus
an 8-character hash of the full branch name (so two branches that happen to
share the same prefix still get distinct keys) -- so different PRs (or
branches) on the same cluster each get their own trigger ConfigMap, Helm
release, OAuth user, and console route (`console-manual-console-<key>.<apps
domain>`) instead of overwriting each other. The namespace
(`manual-console`) stays shared across all of them.

## Tearing down

Manual-console ConfigMaps are exempt from the TTL reaper, so nothing removes
a deployed instance automatically. Once done with it, either comment
`/cleanup-manual-console` on the PR, or run **Deploy Manual Console** with
`action: teardown` and the same `pr_number` used to deploy it (preferred —
cleanup recovers the recorded cluster). For a branch-only deploy (no
`pr_number`), teardown requires the same `cluster_name` used at deploy;
`branch` alone is not a supported teardown identifier. This flips the
trigger ConfigMap's `desired-state` to `absent`; `ci-env-controller` then
removes that instance's Helm release and htpasswd user asynchronously. The
shared `manual-console` namespace itself is only deleted once no other
instance's Helm release remains in it (and never when `auth-mode=openshift`,
so the one-time RBAC bootstrap survives).

Teardown also always deletes that instance's ImageStream / BuildConfig (and
any stray Helm release) in the shared namespace. Deploy creates those _before_
the trigger ConfigMap, so a mid-deploy failure used to leave orphans that
`/cleanup-manual-console` could not see; the artifact sweep covers that case.

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

Before provisioning, the workflow probes whether an HTPasswd OAuth identity
provider can be configured on the cluster. VPC ROKS (Hypershift hosted
control plane) locks the guest `OAuth` CR via `ValidatingAdmissionPolicy`,
so HTPasswd cannot be added in-cluster there.

**When HTPasswd is available** (IPI / classic, or an IDP already present):

1. The workflow generates a random password and masks it in the logs.
2. It writes that password into a short-lived Kubernetes `Secret` in the
   `ci-env` namespace (never into the trigger ConfigMap).
3. `ci-env-controller` reads the Secret, upserts an htpasswd identity
   provider user named after that deploy's instance key (e.g.
   `manual-console-pr-1234`) with that password, grants it `cluster-admin`,
   and **deletes the Secret immediately** -- the password never persists in
   the cluster.
4. The workflow posts the console URL, username, and password to Slack
   (`SLACK_WEBHOOK_URL`), along with the GitHub user who triggered the
   deploy and a link to the run.

Redeploying (either workflow) rotates the password; the previous one stops
working. **Deploy Plugin** sends its own Slack reminder for this reason.

**When HTPasswd is unavailable** (typical VPC ROKS): the deploy uses
`auth-mode=disabled` instead -- the console has no login wall and uses its
ServiceAccount token. Slack posts the URL only (no username/password).

Tearing down an instance (see above) removes that htpasswd user and revokes
its `cluster-admin` grant, in addition to uninstalling its Helm release.

If `SLACK_WEBHOOK_URL` isn't configured, the workflow logs a warning and
skips notification -- the deploy still succeeds, but credentials must be
retrieved by watching the workflow logs (masked) or re-running with the
webhook configured.

## ConfigMap contract additions

`ci-env-controller` treats these fields as strictly optional; any E2E
ConfigMap that omits them (i.e. every existing one) behaves exactly as
before. See [`ci-env/README.md`](../hot-cluster/ci-env/README.md) for the
base contract.

| Field                  | Description                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `auth-mode`            | `openshift` to enable OAuth login; omitted/anything else keeps the default disabled (bearer-token) behavior    |
| `htpasswd-user`        | Username to upsert into the cluster's htpasswd identity provider (required when `auth-mode=openshift`)         |
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

| File                             | Purpose                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `images/setup-plugin-image.sh`   | Builds the kubevirt-plugin image in-cluster via an OpenShift BuildConfig                                                                        |
| `ensure-manual-console-user.sh`  | Upserts the htpasswd user + extracts the cluster CA bundle; invoked by `ci-env-controller` (embedded into its image -- see below)               |
| `manual-console-rbac.yaml`       | One-time, per-cluster Role/RoleBinding granting the ARC runner SA ImageStream/BuildConfig access, scoped to the `manual-console` namespace only |
| `install-manual-console-rbac.sh` | Applies `manual-console-rbac.yaml` with the ServiceAccount subject substituted for the cluster's actual runner scale set name                   |

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
