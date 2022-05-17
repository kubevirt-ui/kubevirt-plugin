import * as React from 'react';

import { useAvailableDataSourcesAndPVCs } from '@catalog/templatescatalog/hooks/useAvailableDataSourcesAndPVCs';
import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  BOOT_SOURCE,
  isDefaultVariantTemplate,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  getGroupVersionKindForModel,
  Operator,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type useTemplatesWithAvailableSourceProps = {
  onlyAvailable: boolean;
  onlyDefault: boolean;
  namespace?: string;
};

export const useTemplatesWithAvailableSource = ({
  onlyAvailable,
  onlyDefault,
  namespace,
}: useTemplatesWithAvailableSourceProps): useTemplatesWithAvailableSourceValues => {
  const [templates, loaded, loadError] = useK8sWatchResource<V1Template[]>({
    groupVersionKind: getGroupVersionKindForModel(TemplateModel),
    namespace,
    isList: true,
    namespaced: true,
    selector: {
      matchExpressions: [
        {
          operator: Operator.In,
          key: TEMPLATE_TYPE_LABEL,
          values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
        },
      ],
    },
  });
  const {
    availableDatasources,
    availablePVCs,
    loaded: bootSourcesLoaded,
  } = useAvailableDataSourcesAndPVCs(templates, loaded);

  const availableTemplates = React.useMemo(() => {
    const isReady = loaded && availableDatasources && availablePVCs;
    const temps =
      isReady &&
      templates.reduce((acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        // data sources
        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          if (availableDatasources[`${ds.namespace}-${ds.name}`]) {
            acc.push(template);
          }
          return acc;
        }

        // pvcs
        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          if (availablePVCs.has(`${pvc.namespace}-${pvc.name}`)) {
            acc.push(template);
          }
          return acc;
        }

        acc.push(template);
        return acc;
      }, [] as V1Template[]);

    return temps || [];
  }, [availableDatasources, availablePVCs, loaded, templates]);

  const filteredTemplates = React.useMemo(() => {
    return (onlyAvailable ? availableTemplates : templates).filter((template) =>
      onlyDefault ? isDefaultVariantTemplate(template) : true,
    );
  }, [availableTemplates, onlyAvailable, onlyDefault, templates]);

  const availableTemplatesUID = React.useMemo(
    () => new Set(availableTemplates.map((template) => template.metadata.uid)),
    [availableTemplates],
  );

  return {
    templates: filteredTemplates,
    availableTemplatesUID,
    loaded,
    bootSourcesLoaded,
    error: loadError,
  };
};

type useTemplatesWithAvailableSourceValues = {
  templates: V1Template[];
  availableTemplatesUID: Set<string>;
  loaded: boolean;
  bootSourcesLoaded: boolean;
  error: any;
};
