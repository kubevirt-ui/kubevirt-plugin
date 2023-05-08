import React, { CSSProperties, FC } from 'react';

import * as eventSourceIcon from '../../../imgs/event-source.svg';

const EventSourceIcon: FC<{ style?: CSSProperties }> = ({ style }) => (
  <img src={eventSourceIcon} style={style} alt="Event Source logo" />
);

export default EventSourceIcon;
