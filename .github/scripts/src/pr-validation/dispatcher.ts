/**
 * Unified PR Validation Dispatcher.
 *
 * Single entry point for ALL pull_request_target events. Routes to the
 * appropriate handler based on the event action:
 *
 *   - opened / synchronize / reopened / edited → PR push validation
 *   - labeled → label gate (review trust, E2E dispatch) + label sync
 *   - unlabeled → label sync
 *
 * Entry point: npx tsx src/pr-validation/dispatcher.ts
 *
 * Required env: EVENT_ACTION, plus handler-specific env vars.
 */

import { requireEnv, safeErrorMessage } from '../utils';

import { main as runLabelGate } from '../label-gate/index';
import { main as runLabelSync } from '../label-sync/index';
import { main as runPrValidation } from '../validation/pr-validation/index';

type EventAction = 'edited' | 'labeled' | 'opened' | 'reopened' | 'synchronize' | 'unlabeled';

const PUSH_ACTIONS = new Set<EventAction>(['opened', 'synchronize', 'reopened', 'edited']);

const main = async (): Promise<void> => {
  const action = requireEnv('EVENT_ACTION') as EventAction;

  if (PUSH_ACTIONS.has(action)) {
    console.log(`Event: ${action} → running PR push validation`);
    process.env.GITHUB_EVENT_ACTION = action;
    await runPrValidation();
    return;
  }

  if (action === 'labeled') {
    console.log(`Event: labeled "${process.env.LABEL_NAME}" → running label gate + label sync`);
    await runLabelGate();
    await runLabelSync();
    return;
  }

  if (action === 'unlabeled') {
    console.log(`Event: unlabeled "${process.env.LABEL_NAME}" → running label sync`);
    await runLabelSync();
    return;
  }

  console.log(`Event: ${action} → no handler, exiting cleanly.`);
};

void main().catch((err) => {
  console.error(`PR Validation dispatcher failed: ${safeErrorMessage(err)}`);
  process.exit(1);
});
