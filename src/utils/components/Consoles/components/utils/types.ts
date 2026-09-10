import type { AccessConsolesActions } from '../AccessConsoles/utils/accessConsoles';

import type { ConsoleState, ConsoleTypes } from './ConsoleConsts';

export type ConsoleType = (typeof ConsoleTypes)[number];

export type ConsoleComponentState = {
  actions: AccessConsolesActions;
  state: ConsoleState;
  type: ConsoleType;
};
