import React, { FCC } from 'react';

import { Skeleton } from '@patternfly/react-core';

import './IconSkeleton.scss';

const IconSkeleton: FCC = () => <Skeleton className="icon-skeleton" shape="circle" />;

export default IconSkeleton;
