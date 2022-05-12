import * as React from 'react';

import { Form } from '@patternfly/react-core';

import SysprepAutounattend from './sysprep-autounattend/SysprepAutounattend';
import SysprepUnattend from './sysprep-unattend/SysprepUnattend';
import SysprepInfo from './SysprepInfo';

import './sysprep.scss';

type SysprepProps = {
  autoUnattend: string;
  onAutoUnattendChange: (value: string) => void;
  unattend: string;
  onUnattendChange: (value: string) => void;
};

const Sysprep: React.FC<SysprepProps> = ({
  autoUnattend,
  onAutoUnattendChange,
  unattend,
  onUnattendChange,
}) => {
  return (
    <Form className="kv-sysprep--main">
      <SysprepInfo />
      <SysprepAutounattend value={autoUnattend} onChange={onAutoUnattendChange} />
      <SysprepUnattend value={unattend} onChange={onUnattendChange} />
    </Form>
  );
};

export default Sysprep;
