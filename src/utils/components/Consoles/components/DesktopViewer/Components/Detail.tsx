import type { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';

import type { DetailProps } from '../utils/types';

const Detail: FC<DetailProps> = ({ title, value }: DetailProps) => (
  <DescriptionItem descriptionData={value} descriptionHeader={title} />
);

export default Detail;
