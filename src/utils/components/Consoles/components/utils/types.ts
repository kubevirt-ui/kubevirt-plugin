import { AccessConsolesActions } from '../AccessConsoles/utils/accessConsoles';

import { ConsoleState, ConsoleTypes } from './ConsoleConsts';

export type ConsoleType = typeof ConsoleTypes[number];

export type ConsoleComponentState = {
  actions: AccessConsolesActions;
  state: ConsoleState;
  type: ConsoleType;
};
