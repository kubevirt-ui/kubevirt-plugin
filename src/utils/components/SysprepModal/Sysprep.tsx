import React, { FC } from 'react';

import { Form } from '@patternfly/react-core';

import SysprepAutounattend from './sysprep-autounattend/SysprepAutounattend';
import SysprepUnattend from './sysprep-unattend/SysprepUnattend';
import SysprepInfo from './SysprepInfo';

import './sysprep.scss';

type SysprepProps = {
  autoUnattend: string;
  onAutoUnattendChange: (value: string) => void;
  onUnattendChange: (value: string) => void;
  unattend: string;
};

const Sysprep: FC<SysprepProps> = ({
  autoUnattend,
  onAutoUnattendChange,
  onUnattendChange,
  unattend,
}) => (
  <Form className="kv-sysprep--main">
    <SysprepInfo />
    <SysprepAutounattend onChange={onAutoUnattendChange} value={autoUnattend} />
    <SysprepUnattend onChange={onUnattendChange} value={unattend} />
  </Form>
);

export default Sysprep;
