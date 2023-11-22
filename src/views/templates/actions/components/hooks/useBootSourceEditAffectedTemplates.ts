import * as React from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  getTemplateParameterValue,
  TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
  TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER,
} from '@kubevirt-utils/resources/template';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useBootSourceEditAffectedTemplates = (obj: V1Template) => {
  const [allTemplates] = useK8sWatchResource<V1Template[]>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    isList: true,
  });

  const affectedTemplates = React.useMemo(() => {
    if (!allTemplates) {
      return [];
    }
    return allTemplates.filter((template) => {
      const dataSourceName = getTemplateParameterValue(
        template,
        TEMPLATE_DATA_SOURCE_NAME_PARAMETER,
      );
      const dataSourceNamespace = getTemplateParameterValue(
        template,
        TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER,
      );
      return (
        dataSourceName &&
        dataSourceNamespace &&
        getTemplateParameterValue(obj, TEMPLATE_DATA_SOURCE_NAME_PARAMETER) === dataSourceName &&
        getTemplateParameterValue(obj, TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER) ===
          dataSourceNamespace
      );
    });
  }, [allTemplates, obj]);

  return affectedTemplates;
};

export default useBootSourceEditAffectedTemplates;
