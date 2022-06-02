import * as React from 'react';

import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type DescriptionProps = {
  title: string;
  content: string | JSX.Element;
};

// a simple DescriptionList item component
const DescriptionItem: React.FC<DescriptionProps> = ({ title, content }) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{title}</DescriptionListTerm>
    <DescriptionListDescription>{content}</DescriptionListDescription>
  </DescriptionListGroup>
);

export default DescriptionItem;
