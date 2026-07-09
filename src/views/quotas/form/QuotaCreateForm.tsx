import React, { type FC } from 'react';

import { SyncedEditor } from '@kubevirt-utils/components/SyncedEditor/SyncedEditor';

import { initialQuotaYaml } from '../utils/constants';
import QuotaFormTitle from './components/QuotaFormTitle';
import QuotaFormEditor from './QuotaFormEditor';
import QuotaYAMLEditor from './QuotaYAMLEditor';

const QuotaCreateForm: FC = () => {
  return (
    <>
      <QuotaFormTitle />
      <SyncedEditor
        displayConversionError
        formEditor={QuotaFormEditor}
        initialData={initialQuotaYaml}
        yamlEditor={QuotaYAMLEditor}
      />
    </>
  );
};

export default QuotaCreateForm;
