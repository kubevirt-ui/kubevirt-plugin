import React, { FC } from 'react';

import { EditorType } from '@kubevirt-utils/components/SyncedEditor/EditorToggle';
import { SyncedEditor } from '@kubevirt-utils/components/SyncedEditor/SyncedEditor';

import { initialQuotaYaml } from '../utils/constants';

import QuotaCreateFormTitle from './components/QuotaCreateFormTitle';
import { LAST_VIEWED_EDITOR_TYPE_USERSETTING_KEY } from './constants';
import QuotaCreateFormSections from './QuotaCreateFormSections';
import QuotaYAMLEditor from './QuotaYAMLEditor';

const QuotaCreateForm: FC = () => {
  return (
    <>
      <QuotaCreateFormTitle />
      <SyncedEditor
        displayConversionError
        FormEditor={QuotaCreateFormSections}
        initialData={initialQuotaYaml}
        initialType={EditorType.Form}
        lastViewUserSettingKey={LAST_VIEWED_EDITOR_TYPE_USERSETTING_KEY}
        onChangeEditorType={() => {}}
        YAMLEditor={QuotaYAMLEditor}
      />
    </>
  );
};

export default QuotaCreateForm;
