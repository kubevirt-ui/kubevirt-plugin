/**
 * Log environment summary + tool availability + versions.
 * Replaces the 3 "Log ..." bash blocks in hot-cluster-e2e-run.yml.
 *
 * Checks tool availability, env vars, oc/virtctl versions, and HCO operand versions.
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { KubeClient } from '../kube-client';
import type { KubeVirt, CDI, SSP } from '../types/hyperconverged';

const md: string[] = [];
const emit = (line: string): void => { md.push(line); console.log(line); };

const commandExists = (cmd: string): boolean => {
  try { execSync(`command -v ${cmd}`, { stdio: 'pipe' }); return true; } catch { return false; }
};

const getVersion = (cmd: string): { client: string; server: string } => {
  try {
    const output = execSync(`${cmd} version 2>/dev/null`, { encoding: 'utf8', timeout: 15000 });
    const client = output.split('\n').find((l) => /client/i.test(l))?.trim() ?? 'N/A';
    const server = output.split('\n').find((l) => /server/i.test(l))?.trim() ?? 'N/A';
    return { client, server };
  } catch { return { client: 'failed', server: 'failed' }; }
};

const main = async (): Promise<void> => {
  // --- Env vars ---
  emit('<details><summary>Key Environment Variables</summary>\n');
  emit('| Variable | Value |');
  emit('| --- | --- |');
  const vars = ['HOME', 'USER', 'RUNNER_NAME', 'RUNNER_OS', 'RUNNER_ARCH',
    'GITHUB_REPOSITORY', 'GITHUB_REF', 'GITHUB_SHA', 'GITHUB_RUN_ID', 'GITHUB_RUN_NUMBER',
    'CNV_NS', 'OS_IMAGES_NS', 'TEST_NS', 'KUBEVIRT_PLUGIN_IMAGE', 'KUBEVIRT_UI_PLUGIN_RUNNER'];
  for (const v of vars) emit(`| \`${v}\` | \`${process.env[v] ?? '<unset>'}\` |`);
  emit('</details>\n');

  // --- Tool availability ---
  emit('<details><summary>Tool Availability</summary>\n');
  emit('| Tool | Available |');
  emit('| --- | --- |');
  const tools = ['jq', 'yq', 'envsubst', 'curl', 'kubectl', 'oc', 'virtctl', 'helm', 'npm', 'node'];
  let missing = false;
  for (const t of tools) {
    const ok = commandExists(t);
    emit(`| \`${t}\` | ${ok ? '✅' : '❌'} |`);
    if (!ok) missing = true;
  }
  emit('</details>\n');
  if (missing) {
    console.error('::error::Required tools are missing on the ARC runner');
    process.exit(1);
  }

  // --- npm / Node versions ---
  emit('<details><summary>npm / Node Versions</summary>\n');
  emit('```json');
  try { emit(execSync('npm version --json', { encoding: 'utf8' })); } catch { emit('npm not found'); }
  emit('```');
  emit('</details>\n');

  // --- Client/server versions ---
  emit('<details><summary>Client / Server Versions</summary>\n');
  emit('| Tool | Client Version | Server Version |');
  emit('| --- | --- | --- |');
  let versionFailed = false;
  for (const cmd of ['oc', 'virtctl']) {
    if (!commandExists(cmd)) {
      emit(`| \`${cmd}\` | ❌ not found | — |`);
      versionFailed = true;
    } else {
      const v = getVersion(cmd);
      emit(`| \`${cmd}\` | ${v.client} | ${v.server} |`);
      if (v.client === 'failed') versionFailed = true;
    }
  }
  emit('</details>\n');
  if (versionFailed) {
    console.error('::error::Client/server version checks failed');
    process.exit(1);
  }

  // --- HCO operand versions (via K8s API) ---
  emit('<details><summary>HCO & Managed Operator Versions</summary>\n');
  try {
    const client = KubeClient.fromKubeconfig();
    const api = client.customObjects;
    const HCO_LABEL = 'app.kubernetes.io/managed-by=hco-operator';

    // CSVs
    emit('### HCO Version (OLM CSV)\n');
    emit('| Name | Version | Phase |');
    emit('| --- | --- | --- |');
    try {
      const csvs = (await api.listNamespacedCustomObject({
        group: 'operators.coreos.com', version: 'v1alpha1', namespace: 'openshift-cnv', plural: 'clusterserviceversions',
      })) as unknown as { items: Array<{ metadata: { name: string }; spec?: { version?: string }; status?: { phase?: string } }> };
      const hcoCsvs = csvs.items.filter((c) => /hyperconverged/i.test(c.metadata.name));
      for (const c of hcoCsvs) emit(`| \`${c.metadata.name}\` | \`${c.spec?.version ?? ''}\` | ${c.status?.phase ?? ''} |`);
      if (hcoCsvs.length === 0) emit('| — | HCO CSV not found | — |');
    } catch { emit('| — | HCO CSV not found | — |'); }

    emit('\n### HCO Managed Operand Versions\n');
    emit('| Operand | Version |');
    emit('| --- | --- |');

    const getOperandVersion = async (group: string, version: string, plural: string, field: string): Promise<string> => {
      try {
        const result = (await api.listClusterCustomObject({ group, version, plural, labelSelector: HCO_LABEL })) as unknown as { items: Array<Record<string, unknown>> };
        const status = (result.items[0] as { status?: Record<string, unknown> })?.status;
        return (status?.[field] as string) ?? 'not found';
      } catch { return 'not found'; }
    };

    emit(`| \`kubevirt\` | \`${await getOperandVersion('kubevirt.io', 'v1', 'kubevirts', 'observedKubeVirtVersion')}\` |`);
    emit(`| \`cdi\` | \`${await getOperandVersion('cdi.kubevirt.io', 'v1beta1', 'cdis', 'observedVersion')}\` |`);
    emit(`| \`ssp\` | \`${await getOperandVersion('ssp.kubevirt.io', 'v1beta2', 'ssps', 'observedVersion')}\` |`);
    emit(`| \`cnao\` | \`${await getOperandVersion('networkaddonsoperator.network.kubevirt.io', 'v1', 'networkaddonsconfigs', 'observedVersion')}\` |`);
    emit(`| \`hostpath-provisioner\` | \`${await getOperandVersion('hostpathprovisioner.kubevirt.io', 'v1beta1', 'hostpathprovisioners', 'observedVersion')}\` |`);
  } catch {
    emit('> ⚠️ Could not query cluster for operand versions.');
  }
  emit('</details>\n');

  // Write to step summary
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) appendFileSync(summaryFile, md.join('\n'));
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
