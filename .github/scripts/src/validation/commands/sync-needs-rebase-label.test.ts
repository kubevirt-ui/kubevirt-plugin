import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

const require = createRequire(__filename);
const { COMMENT_MARKER, NEEDS_REBASE_LABEL, syncNeedsRebaseLabel } = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/sync-needs-rebase-label.cjs'),
) as {
  COMMENT_MARKER: string;
  NEEDS_REBASE_LABEL: string;
  syncNeedsRebaseLabel: (args: {
    github: unknown;
    core: { info: (msg: string) => void };
    context: { repo: { owner: string; repo: string } };
    prNumber: number;
  }) => Promise<void>;
};

type Call = { method: string; args: unknown };

const fakeGithub = (opts: {
  mergeable: boolean | null;
  labels?: string[];
  existingComments?: string[];
  getLabelStatus?: number;
  createLabelStatus?: number;
}) => {
  const calls: Call[] = [];
  const labels = opts.labels ?? [];
  const comments = (opts.existingComments ?? []).map((body, i) => ({ id: i + 1, body }));

  const github = {
    paginate: async (fn: unknown, args: unknown) => {
      calls.push({ method: 'paginate', args });
      if (fn === github.rest.issues.listComments) return comments;
      return [];
    },
    rest: {
      pulls: {
        get: async (args: unknown) => {
          calls.push({ method: 'pulls.get', args });
          return {
            data: {
              mergeable: opts.mergeable,
              base: { ref: 'main' },
              user: { login: 'pr-author' },
              labels: labels.map((name) => ({ name })),
            },
          };
        },
      },
      issues: {
        listComments: async () => ({ data: comments }),
        getLabel: async (args: unknown) => {
          calls.push({ method: 'getLabel', args });
          if (opts.getLabelStatus === 404) {
            const err = new Error('Not Found') as Error & { status: number };
            err.status = 404;
            throw err;
          }
          return { data: {} };
        },
        createLabel: async (args: unknown) => {
          calls.push({ method: 'createLabel', args });
          if (opts.createLabelStatus === 422) {
            const err = new Error('already_exists') as Error & { status: number };
            err.status = 422;
            throw err;
          }
        },
        addLabels: async (args: unknown) => {
          calls.push({ method: 'addLabels', args });
        },
        removeLabel: async (args: unknown) => {
          calls.push({ method: 'removeLabel', args });
        },
        createComment: async (args: unknown) => {
          calls.push({ method: 'createComment', args });
        },
        deleteComment: async (args: unknown) => {
          calls.push({ method: 'deleteComment', args });
        },
      },
    },
  };

  return { github, calls };
};

const core = { info: () => {} };
const context = { repo: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin' } };

describe('syncNeedsRebaseLabel', () => {
  it('skips when mergeable is still null', async () => {
    const { github, calls } = fakeGithub({ mergeable: null });
    await syncNeedsRebaseLabel({ github, core, context, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
  });

  it('applies label + comment on first conflict', async () => {
    const { github, calls } = fakeGithub({ mergeable: false, getLabelStatus: 404 });
    await syncNeedsRebaseLabel({ github, core, context, prNumber: 42 });

    assert.equal(
      calls.some((c) => c.method === 'createLabel'),
      true,
    );
    assert.deepEqual(
      (calls.find((c) => c.method === 'addLabels')?.args as { labels: string[] }).labels,
      [NEEDS_REBASE_LABEL],
    );
    const comment = calls.find((c) => c.method === 'createComment');
    assert.ok(((comment?.args as { body: string }).body || '').includes(COMMENT_MARKER));
  });

  it('tolerates 422 already_exists when creating the label', async () => {
    const { github, calls } = fakeGithub({
      mergeable: false,
      getLabelStatus: 404,
      createLabelStatus: 422,
    });
    await syncNeedsRebaseLabel({ github, core, context, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      true,
    );
  });

  it('does not re-comment when the marker is already present', async () => {
    const { github, calls } = fakeGithub({
      mergeable: false,
      labels: [NEEDS_REBASE_LABEL],
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
    });
    await syncNeedsRebaseLabel({ github, core, context, prNumber: 42 });
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('removes the label and marker comments when mergeable becomes true', async () => {
    const { github, calls } = fakeGithub({
      mergeable: true,
      labels: [NEEDS_REBASE_LABEL],
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
    });
    await syncNeedsRebaseLabel({ github, core, context, prNumber: 42 });
    assert.equal(
      (calls.find((c) => c.method === 'removeLabel')?.args as { name: string }).name,
      NEEDS_REBASE_LABEL,
    );
    assert.equal(
      calls.some((c) => c.method === 'deleteComment'),
      true,
    );
  });
});
