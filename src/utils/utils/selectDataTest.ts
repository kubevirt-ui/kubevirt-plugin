import { MenuToggleProps } from '@patternfly/react-core';

export const getSelectDataTestProps = (dataTest?: string) => {
  if (!dataTest) {
    return {};
  }

  const toggleProps = { 'data-test': `${dataTest}-toggle` } as MenuToggleProps;

  return {
    'data-test': `${dataTest}-select`,
    toggleProps,
  };
};
