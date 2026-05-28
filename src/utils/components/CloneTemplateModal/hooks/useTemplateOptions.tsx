import React, { useMemo } from 'react';

import {
  EMPTY_OPTION_KEY,
  ERROR_OPTION_KEY,
  LOADING_OPTION_KEY,
} from '@kubevirt-utils/components/FilterSelect/utils/constants';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { sortTemplates, Template } from '@kubevirt-utils/resources/template';
import { TemplateModelGroupVersionKind } from '@kubevirt-utils/resources/template/hooks/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { useOpenShiftTemplates } from '@templates/list/hooks/useOpenShiftTemplates';

import { getTemplateOptionKey } from '../utils';

type UseTemplateOptions = (namespace?: string) => {
  hasOptions: boolean;
  options: EnhancedSelectOptionProps[];
  templateMap: Map<string, Template>;
};

const useTemplateOptions: UseTemplateOptions = (namespace) => {
  const { t } = useKubevirtTranslation();
  const { error, loaded, templates } = useOpenShiftTemplates({ namespace });

  const sortedTemplates = useMemo(() => sortTemplates(templates ?? []), [templates]);

  const options = useMemo<EnhancedSelectOptionProps[]>(() => {
    if (error) {
      return [
        {
          children: (
            <HelperText>
              <HelperTextItem variant="error">{t('Error loading templates')}</HelperTextItem>
            </HelperText>
          ),
          isDisabled: true,
          value: ERROR_OPTION_KEY,
        },
      ];
    }

    if (!loaded) {
      return [
        {
          children: t('Loading templates...'),
          isDisabled: true,
          value: LOADING_OPTION_KEY,
        },
      ];
    }

    if (isEmpty(sortedTemplates)) {
      return [
        {
          children: t('No templates found'),
          isDisabled: true,
          value: EMPTY_OPTION_KEY,
        },
      ];
    }

    return sortedTemplates.map((template) => ({
      groupVersionKind: TemplateModelGroupVersionKind,
      label: getName(template),
      value: getTemplateOptionKey(template),
    }));
  }, [loaded, error, sortedTemplates, t]);

  const hasOptions = !error && loaded && !isEmpty(sortedTemplates);

  const templateMap = useMemo(
    () => new Map(sortedTemplates.map((tmpl) => [getTemplateOptionKey(tmpl), tmpl])),
    [sortedTemplates],
  );

  return { hasOptions, options, templateMap };
};

export default useTemplateOptions;
