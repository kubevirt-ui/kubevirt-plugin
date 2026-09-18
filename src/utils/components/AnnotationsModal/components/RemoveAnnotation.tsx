import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

type RemoveAnnotationProps = {
  annotationKey: string;
  isProtected?: boolean;
  onDelete: () => void;
};

const RemoveAnnotation: FC<RemoveAnnotationProps> = ({ annotationKey, isProtected, onDelete }) => {
  const { t } = useKubevirtTranslation();

  const removeButton = (
    <Button
      aria-label={t('Remove annotation')}
      data-test={`delete-annotation-row-${annotationKey}`}
      icon={<MinusCircleIcon />}
      isAriaDisabled={Boolean(isProtected)}
      onClick={isProtected ? undefined : onDelete}
      variant={ButtonVariant.plain}
    />
  );

  if (isProtected) {
    return (
      <Tooltip content={t('This annotation is system-managed and cannot be removed')}>
        {removeButton}
      </Tooltip>
    );
  }

  return removeButton;
};

export default RemoveAnnotation;
