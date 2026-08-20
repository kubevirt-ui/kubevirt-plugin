import React, { type FC } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';

import { type UploadSuccessLink } from '../types';

type UploadProgressLinksProps = {
  links?: UploadSuccessLink[];
  navigate: (path: string) => void;
};

const UploadProgressLinks: FC<UploadProgressLinksProps> = ({ links = [], navigate }) => (
  <>
    {links.map((link) => (
      <Button
        data-test="upload-progress-link"
        isInline
        key={link.url}
        onClick={() => navigate(link.url)}
        variant={ButtonVariant.link}
      >
        {link.label}
      </Button>
    ))}
  </>
);

export default UploadProgressLinks;
