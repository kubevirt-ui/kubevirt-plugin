/**
 * Log environment summary + tool availability + versions.
 * Replaces the 3 "Log ..." bash blocks in hot-cluster-e2e-run.yml.
 *
 * Checks tool availability, env vars, oc/virtctl versions, and HCO operand versions.
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { logHcoOperandVersions } from './log-env-summary-hco';

const markdownLines: string[] = [];
const emit = (line: string): void => {
  markdownLines.push(line);
  console.log(line);
};

const commandExists = (cmd: string): boolean => {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const getVersion = (cmd: string): { client: string; server: string } => {
  try {
    const output = execSync(`${cmd} version 2>/dev/null`, { encoding: 'utf8', timeout: 15000 });
    const client =
      output
        .split('\n')
        .find((line) => /client/i.test(line))
        ?.trim() ?? 'N/A';
    const server =
      output
        .split('\n')
        .find((line) => /server/i.test(line))
        ?.trim() ?? 'N/A';
    return { client, server };
  } catch {
    return { client: 'failed', server: 'failed' };
  }
};

const main = async (): Promise<void> => {
  // --- Env vars ---
  emit('<details><summary>Key Environment Variables</summary>\n');
  emit('| Variable | Value |');
  emit('| --- | --- |');
  const vars = [
    'HOME',
    'USER',
    'RUNNER_NAME',
    'RUNNER_OS',
    'RUNNER_ARCH',
    'GITHUB_REPOSITORY',
    'GITHUB_REF',
    'GITHUB_SHA',
    'GITHUB_RUN_ID',
    'GITHUB_RUN_NUMBER',
    'CNV_NS',
    'OS_IMAGES_NS',
    'TEST_NS',
    'KUBEVIRT_PLUGIN_IMAGE',
    'KUBEVIRT_UI_PLUGIN_RUNNER',
  ];
  for (const varName of vars) {
    emit(`| \`${varName}\` | \`${process.env[varName] ?? '<unset>'}\` |`);
  }
  emit('</details>\n');

  // --- Tool availability ---
  emit('<details><summary>Tool Availability</summary>\n');
  emit('| Tool | Available |');
  emit('| --- | --- |');
  const tools = ['jq', 'yq', 'envsubst', 'curl', 'kubectl', 'oc', 'virtctl', 'helm', 'npm', 'node'];
  const toolResults = tools.map((t) => ({ ok: commandExists(t), tool: t }));
  const missing = toolResults.some((result) => !result.ok);
  for (const { ok, tool } of toolResults) {
    emit(`| \`${tool}\` | ${ok ? '✅' : '❌'} |`);
  }
  emit('</details>\n');
  if (missing) {
    console.error('::error::Required tools are missing on the ARC runner');
    process.exit(1);
  }

  // --- npm / Node versions ---
  emit('<details><summary>npm / Node Versions</summary>\n');
  emit('```json');
  try {
    emit(execSync('npm version --json', { encoding: 'utf8' }));
  } catch {
    emit('npm not found');
  }
  emit('```');
  emit('</details>\n');

  // --- Client/server versions ---
  emit('<details><summary>Client / Server Versions</summary>\n');
  emit('| Tool | Client Version | Server Version |');
  emit('| --- | --- | --- |');
  const versionResults = ['oc', 'virtctl'].map((cmd) => {
    if (!commandExists(cmd)) {
      emit(`| \`${cmd}\` | ❌ not found | — |`);
      return false;
    }
    const versionInfo = getVersion(cmd);
    emit(`| \`${cmd}\` | ${versionInfo.client} | ${versionInfo.server} |`);
    return versionInfo.client !== 'failed';
  });
  const versionFailed = versionResults.some((succeeded) => !succeeded);
  emit('</details>\n');
  if (versionFailed) {
    console.error('::error::Client/server version checks failed');
    process.exit(1);
  }

  // --- HCO operand versions (via K8s API) ---
  await logHcoOperandVersions(emit);

  // Write to step summary
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(summaryFile, markdownLines.join('\n'));
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
