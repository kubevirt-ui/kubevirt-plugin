/**
 * Unified PR Validation Dispatcher.
 *
 * Single entry point for ALL pull_request_target events. For label
 * events, runs the label-specific handlers first, then ALWAYS runs the
 * full push validation so the workflow exit code reflects true PR state.
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

const main = async (): Promise<void> => {
  const action = requireEnv('EVENT_ACTION') as EventAction;

  if (action === 'labeled') {
    console.log(`Event: labeled "${process.env.LABEL_NAME}" → running label gate + label sync`);
    try {
      await runLabelGate();
    } catch (err) {
      console.error(`Label gate failed: ${safeErrorMessage(err)}`);
    }
    try {
      await runLabelSync();
    } catch (err) {
      console.error(`Label sync failed: ${safeErrorMessage(err)}`);
    }
  } else if (action === 'unlabeled') {
    console.log(`Event: unlabeled "${process.env.LABEL_NAME}" → running label sync`);
    try {
      await runLabelSync();
    } catch (err) {
      console.error(`Label sync failed: ${safeErrorMessage(err)}`);
    }
  }

  console.log(`Running PR validation (event: ${action})`);
  process.env.GITHUB_EVENT_ACTION = action;
  await runPrValidation();
};

void main().catch((err) => {
  console.error(`PR Validation dispatcher failed: ${safeErrorMessage(err)}`);
});
