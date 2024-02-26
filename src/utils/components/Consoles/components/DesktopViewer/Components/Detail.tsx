import React, { FC } from 'react';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import { DetailProps } from '../utils/types';

const Detail: FC<DetailProps> = ({ title, value }: DetailProps) => (
  <VirtualMachineDescriptionItem descriptionData={value} descriptionHeader={title} />
);

export default Detail;
