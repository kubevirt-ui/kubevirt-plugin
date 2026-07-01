import React, { FC } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';

import { UploadSuccessLink } from '../types';

type UploadProgressLinksProps = {
  links?: UploadSuccessLink[];
  navigate: (path: string) => void;
};

const UploadProgressLinks: FC<UploadProgressLinksProps> = ({ links = [], navigate }) => (
  <>
    {links.map((link, index) => (
      <Button
        isInline
        key={`${link.url}-${index}`}
        onClick={() => navigate(link.url)}
        variant={ButtonVariant.link}
      >
        {link.label}
      </Button>
    ))}
  </>
);

export default UploadProgressLinks;
