import { type MenuToggleProps } from '@patternfly/react-core';

type SelectDataTestProps =
  | Record<string, never>
  | {
      'data-test': string;
      toggleProps: MenuToggleProps;
    };

export const getSelectDataTestProps = (dataTest?: string): SelectDataTestProps => {
  if (!dataTest) {
    return {};
  }

  const toggleProps = {
    'data-test': `${dataTest}-toggle`,
  } as MenuToggleProps;

  return {
    'data-test': `${dataTest}-select`,
    toggleProps,
  };
};
