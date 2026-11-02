import type { JSX, ReactNode } from 'react';
import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDefaultCreateValues } from '@kubevirt-utils/components/DiskModal/utils/form';
import {
  SourceTypes,
  type V1DiskFormState,
} from '@kubevirt-utils/components/DiskModal/utils/types';
import i18n from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';

import { initStoryI18n } from './i18n';
import { storyVmObject } from './story-fixtures';

type StoryScaffoldProps = {
  children: ReactNode;
};

const storyRouterPath = '/k8s/ns/default/kubevirt.io~v1~VirtualMachine/story-vm/';

export const StoryFormProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const defaultValues = useMemo(
    () => getDefaultCreateValues(storyVmObject as V1VirtualMachine, SourceTypes.BLANK),
    [],
  );
  const methods = useForm<V1DiskFormState>({ defaultValues, mode: 'onChange' });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

export const StoryScaffold = ({ children }: StoryScaffoldProps): JSX.Element => {
  initStoryI18n();
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[storyRouterPath]}>
        <StoryFormProvider>{children}</StoryFormProvider>
      </MemoryRouter>
    </I18nextProvider>
  );
};
