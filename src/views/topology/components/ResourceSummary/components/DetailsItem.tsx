import React, { FC, MouseEvent, ReactNode } from 'react';
import classnames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { get, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForResource,
  K8sResourceCommon,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover, Split, SplitItem } from '@patternfly/react-core';

import { getPropertyDescription } from '../utils/swagger';

import EditButton from './EditButton';
import LinkifyExternal from './LinkifyExternal';
import PropertyPath from './PropertyPath';

export type DetailsItemProps = {
  canEdit?: boolean;
  defaultValue?: ReactNode;
  description?: string;
  editAsGroup?: boolean;
  hideEmpty?: boolean;
  label: string;
  labelClassName?: string;
  obj?: K8sResourceCommon;
  onEdit?: (e: MouseEvent<HTMLButtonElement>) => void;
  path?: string | string[];
  valueClassName?: string;
};

const DetailsItem: FC<DetailsItemProps> = ({
  canEdit = true,
  children,
  defaultValue = '-',
  description,
  editAsGroup,
  hideEmpty,
  label,
  labelClassName,
  obj,
  onEdit,
  path,
  valueClassName,
}) => {
  const { t } = useKubevirtTranslation();
  const [model] = useK8sModel(obj ? getGroupVersionKindForResource(obj) : '');
  const hide = hideEmpty && isEmpty(get(obj, path));
  const popoverContent: string = description ?? getPropertyDescription(model, path);
  const value: ReactNode = children || get(obj, path, defaultValue);
  const editable = onEdit && canEdit;
  return hide ? null : (
    <>
      <dt
        className={classnames('details-item__label', labelClassName)}
        data-test-selector={`details-item-label__${label}`}
      >
        <Split>
          <SplitItem className="details-item__label">
            {popoverContent || path ? (
              <Popover
                headerContent={<div>{label}</div>}
                {...(popoverContent && {
                  bodyContent: (
                    <LinkifyExternal>
                      <div className="co-pre-line">{popoverContent}</div>
                    </LinkifyExternal>
                  ),
                })}
                {...(path && { footerContent: <PropertyPath kind={model?.kind} path={path} /> })}
                maxWidth="30rem"
              >
                <Button className="details-item__popover-button" data-test={label} variant="plain">
                  {label}
                </Button>
              </Popover>
            ) : (
              label
            )}
          </SplitItem>
          {editable && editAsGroup && (
            <>
              <SplitItem isFilled />
              <SplitItem>
                <EditButton onClick={onEdit} testId={label}>
                  {t('Edit')}
                </EditButton>
              </SplitItem>
            </>
          )}
        </Split>
      </dt>
      <dd
        className={classnames('details-item__value', valueClassName, {
          'details-item__value--group': editable && editAsGroup,
        })}
        data-test-selector={`details-item-value__${label}`}
      >
        {editable && !editAsGroup ? (
          <EditButton onClick={onEdit} testId={label}>
            {value}
          </EditButton>
        ) : (
          value
        )}
      </dd>
    </>
  );
};

export default DetailsItem;
