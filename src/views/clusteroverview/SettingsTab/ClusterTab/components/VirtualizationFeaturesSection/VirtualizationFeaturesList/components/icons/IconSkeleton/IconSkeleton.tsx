import React, { FC } from 'react';

import { Skeleton } from '@patternfly/react-core';

import './IconSkeleton.scss';

const IconSkeleton: FC = () => <Skeleton className="icon-skeleton" shape="circle" />;

export default IconSkeleton;
