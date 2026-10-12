import { safeErrorMessage } from '../../utils';
import type { ValidationCommand } from './parse-command';

export type CommandOutcome = { command: ValidationCommand; error?: unknown };
export type CommandHandlers = Record<ValidationCommand, () => Promise<void>>;

/** Runs each command's handler in isolation -- one command's failure never stops the rest from running. */
export const processCommands = async (
  commands: ValidationCommand[],
  handlers: CommandHandlers,
): Promise<CommandOutcome[]> => {
  const outcomes: CommandOutcome[] = [];
  for (const command of commands) {
    try {
      await handlers[command]();
      outcomes.push({ command });
    } catch (error) {
      outcomes.push({ command, error });
    }
  }
  return outcomes;
};

/** Logs a single command failure. Handlers already synced labels/status before throwing when applicable. */
export const reportCommandFailure = (outcome: Required<CommandOutcome>): void => {
  console.error(`${outcome.command} failed: ${safeErrorMessage(outcome.error)}`);
};
