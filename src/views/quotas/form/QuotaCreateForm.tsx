import React, { FCC } from 'react';

import { SyncedEditor } from '@kubevirt-utils/components/SyncedEditor/SyncedEditor';

import { initialQuotaYaml } from '../utils/constants';

import QuotaFormTitle from './components/QuotaFormTitle';
import QuotaFormEditor from './QuotaFormEditor';
import QuotaYAMLEditor from './QuotaYAMLEditor';

const QuotaCreateForm: FCC = () => {
  return (
    <>
      <QuotaFormTitle />
      <SyncedEditor
        displayConversionError
        FormEditor={QuotaFormEditor}
        initialData={initialQuotaYaml}
        YAMLEditor={QuotaYAMLEditor}
      />
    </>
  );
};

export default QuotaCreateForm;
