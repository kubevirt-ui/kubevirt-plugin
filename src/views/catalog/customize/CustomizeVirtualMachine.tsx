import * as React from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { CustomizeError } from './components/CustomizeError';
import { CustomizeForm } from './components/CustomizeForms/CustomizeForm';
import CustomizeFormWithStorage from './components/CustomizeForms/CustomizeFormWithStorage';
import { CustomizeVirtualMachineSkeleton } from './components/CustomizeVirtualMachineSkeleton';
import { RightHeader } from './components/RightHeading';
import { hasCustomizableSource } from './utils';

import './CustomizeVirtualMachine.scss';

const CustomizeVirtualMachine: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { params } = useURLParams();
  const name = params.get('name');
  const templateNamespace = params.get('namespace');

  const [template, loaded, error] = useK8sWatchResource<V1Template>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    isList: false,
    namespaced: true,
    name,
    namespace: templateNamespace,
  });

  const Form = React.useMemo(() => {
    const withDiskSource = hasCustomizableSource(template);

    if (withDiskSource) {
      return CustomizeFormWithStorage;
    } else {
      return CustomizeForm;
    }
  }, [template]);

  if (error) return <CustomizeError />;

  return (
    <div className="co-m-pane__body">
      <h1 className="co-m-pane__heading">{t('Create VirtualMachine from template')}</h1>
      <div className="row">
        <div className="col-md-7 col-md-push-5 co-catalog-item-info">
          <RightHeader template={template} />
        </div>
        <div className="col-md-5 col-md-pull-7">
          {template && loaded && <Form template={template} />}
          {!loaded && <CustomizeVirtualMachineSkeleton />}
        </div>
      </div>
    </div>
  );
};

export default CustomizeVirtualMachine;
