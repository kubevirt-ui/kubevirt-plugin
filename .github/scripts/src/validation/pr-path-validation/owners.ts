import { Buffer } from 'buffer';

import type { Octokit } from '@octokit/rest';

/** The primary identity commands/approve.ts uses to add reviewed/skip labels. */
export const APPROVAL_BOT_LOGIN = 'kubevirt-plugin-bot[bot]';

const TRUSTED_BOT_LOGINS: ReadonlySet<string> = new Set([APPROVAL_BOT_LOGIN, 'openshift-ci[bot]']);

export const isTrustedBot = (login: string): boolean => TRUSTED_BOT_LOGINS.has(login);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Extract just the approvers: block's lines -- not reviewers: or anything else -- so a username only ever matches as an approver. */
const extractApproversBlock = (ownersYaml: string): string => {
  const lines = ownersYaml.split('\n');
  const startIndex = lines.findIndex((line) => /^approvers:\s*$/.test(line));
  if (startIndex === -1) {
    return '';
  }

  const blockLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    const withoutComment = line.replace(/#.*$/, '').trimEnd();
    const trimmed = withoutComment.trim();
    if (trimmed === '') {
      continue;
    }
    if (!trimmed.startsWith('-')) {
      break;
    }
    blockLines.push(withoutComment);
  }
  return blockLines.join('\n');
};

/**
 * Return true when the user is an approver in the given OWNERS file's
 * approvers: block (never reviewers:) at the PR's base ref -- never the
 * PR's own branch, so a PR can't self-approve by editing OWNERS in its
 * own diff. Defaults to the narrower .github/OWNERS (kept in sync with
 * .cursor/OWNERS), not the root OWNERS file.
 */
export const isListedInOwners = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  username: string,
  ownersPath = '.github/OWNERS',
): Promise<boolean> => {
  try {
    const { data } = await octokit.repos.getContent({ owner, path: ownersPath, ref, repo });
    if (!('content' in data) || typeof data.content !== 'string') {
      return false;
    }

    const owners = Buffer.from(data.content, 'base64').toString('utf8');
    const approversBlock = extractApproversBlock(owners);
    // GitHub logins are case-insensitive -- match OWNERS entries the same way.
    return new RegExp(`^\\s*-\\s*${escapeRegExp(username)}\\s*$`, 'im').test(approversBlock);
  } catch {
    return false;
  }
};

/**
 * Return true only when the most recent time `labelName` was added to this
 * PR, the actor was the approval bot or an OWNERS-listed user. Labels are
 * presence-only signals -- pr-validation.yml strips an untrusted
 * skip/reviewed label soon after it's applied, but a validation run
 * triggered by a near-simultaneous event (e.g. a push right after the
 * label) could otherwise race ahead of that and trust it anyway. Fails
 * closed (false) if the applying actor can't be determined.
 */
export const isLabelAppliedByTrustedActor = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  labelName: string,
  baseRef: string,
): Promise<boolean> => {
  try {
    const events = await octokit.paginate(octokit.issues.listEvents, {
      issue_number: issueNumber,
      owner,
      per_page: 100,
      repo,
    });

    const labelEvents = events.filter(
      (event): event is typeof event & { label: { name?: string } } =>
        event.event === 'labeled' && 'label' in event,
    );
    const actor = labelEvents.filter((event) => event.label.name === labelName).at(-1)
      ?.actor?.login;
    if (!actor) {
      return false;
    }

    if (isTrustedBot(actor)) {
      return true;
    }
    return await isListedInOwners(octokit, owner, repo, baseRef, actor);
  } catch {
    return false;
  }
};
