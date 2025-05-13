import React, { FC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import './LinkStateIcon.scss';

const LinkStateUnknownIcon: FC = () => <div className="link-state-icon">{NO_DATA_DASH}</div>;

export default LinkStateUnknownIcon;
