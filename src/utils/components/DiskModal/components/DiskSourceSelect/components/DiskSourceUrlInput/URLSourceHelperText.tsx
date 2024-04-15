import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { urlSourceHelperTextMapper } from './utils/constants';
import { DiskSourceUrlInputProps } from './utils/types';

const URLSourceHelperText: FC<DiskSourceUrlInputProps> = ({ os }) => {
  const { afterLabelText, beforeLabelText, label } = urlSourceHelperTextMapper[os];
  return (
    <>
      {beforeLabelText}
      <strong>
        <Link rel="noreferrer" target="_blank" to={OS_IMAGE_LINKS[os || OS_NAME_TYPES.fedora]}>
          {label}
        </Link>
      </strong>
      {afterLabelText}
    </>
  );
};

export default URLSourceHelperText;
