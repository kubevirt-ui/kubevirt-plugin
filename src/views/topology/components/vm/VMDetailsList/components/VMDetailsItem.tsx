import React, { FC, ReactNode } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import LoadingInline from '../../../LoadingInline/LoadingInline';
import VMEditWithPencil from '../../../VMEditWithPencil';

type VMDetailsItemProps = {
  arePendingChanges?: boolean;
  canEdit?: boolean;
  children: ReactNode;
  dataTest?: string;
  editButtonId?: string;
  editClassName?: string;
  idValue?: string;
  isLoading?: boolean;
  isNotAvail?: boolean;
  isNotAvailMessage?: string;
  onEditClick?: () => void;
  title: string;
  valueClassName?: string;
};

const VMDetailsItem: FC<VMDetailsItemProps> = ({
  arePendingChanges,
  canEdit = false,
  children,
  dataTest,
  editButtonId,
  editClassName,
  idValue,
  isLoading = false,
  isNotAvail = false,
  isNotAvailMessage,
  onEditClick,
  title,
  valueClassName,
}) => {
  const { t } = useKubevirtTranslation();
  let body;

  if (isNotAvail) {
    body = <MutedTextSpan text={isNotAvailMessage || t('Not available')} />;
  } else if (isLoading) {
    body = <LoadingInline />;
  } else {
    body = children;
  }

  return (
    <>
      <dt>
        <span className={editClassName} data-test={dataTest}>
          {title}
          <VMEditWithPencil ButtonID={editButtonId} isEdit={canEdit} onEditClick={onEditClick} />
          {arePendingChanges && (
            <Button
              className="kv-vm-resource--link-pending-changes"
              isInline
              onClick={onEditClick}
              variant="link"
            >
              {t('View Pending Changes')}
            </Button>
          )}
        </span>
      </dt>
      <dd className={valueClassName} id={idValue}>
        <span data-test-id={`details-${title}`}>{body}</span>
      </dd>
    </>
  );
};

export default VMDetailsItem;
