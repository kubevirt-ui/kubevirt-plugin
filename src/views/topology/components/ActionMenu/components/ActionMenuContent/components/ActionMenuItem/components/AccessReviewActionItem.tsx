import React from 'react';
import { connect } from 'react-redux';

import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';

import { ActionMenuItemProps } from '../ActionMenuItem';

import ActionItem from './ActionItem';

const AccessReviewActionItem = connect(impersonateStateToProps)(
  (props: ActionMenuItemProps & { impersonate: ImpersonateKind }) => {
    const { action, impersonate } = props;
    const [isAllowed] = useAccessReview(action.accessReview, impersonate);
    return <ActionItem {...props} isAllowed={isAllowed} />;
  },
);

export default AccessReviewActionItem;
