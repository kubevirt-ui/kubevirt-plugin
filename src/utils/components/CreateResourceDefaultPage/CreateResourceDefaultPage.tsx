import React, { FC } from 'react';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import './CreateResourceDefaultPage.scss';

type CreateResourceDefaultPageProps = {
  header: string;
  initialResource:
    | {
        [key: string]: any;
      }
    | string;
};

const CreateResourceDefaultPage: FC<CreateResourceDefaultPageProps> = ({
  header,
  initialResource,
}) => {
  return <ResourceYAMLEditor create header={header} initialResource={initialResource} />;
};

export default CreateResourceDefaultPage;
