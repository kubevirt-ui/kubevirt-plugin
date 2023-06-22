import { ComponentClass } from 'react';

export type InstanceTypeSize = {
  cpus: number;
  memory: string;
  sizeLabel: string;
};

export type RedHatInstanceTypeSeries = {
  classAnnotation: string;
  descriptionAnnotation: string;
  seriesName: string;
  sizes: InstanceTypeSize[];
};

export type RedHatInstanceType = {
  Icon: ComponentClass;
  id: string;
  items: RedHatInstanceTypeSeries[];
  label: string;
};

export type UserInstanceType = {
  Icon: ComponentClass;
  id: string;
  items: string[];
  label: string;
};

export type InstanceTypesMenuItemsData = {
  redHatProvided: RedHatInstanceType;
  userProvided: UserInstanceType;
};
