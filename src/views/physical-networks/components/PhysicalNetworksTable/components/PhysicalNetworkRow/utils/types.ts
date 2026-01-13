import { ReactElement } from 'react';

export type PhysicalNetworksRowAction = {
  onClick: () => void;
  title: ReactElement;
};

export type PhysicalNetworksRowActions = PhysicalNetworksRowAction[];
