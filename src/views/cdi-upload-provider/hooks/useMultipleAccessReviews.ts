import { useEffect, useState } from 'react';

import { AccessReviewResourceAttributes, checkAccess } from '@openshift-console/dynamic-plugin-sdk';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';

type UseMultipleAccessReviews = (
  multipleResourceAttributes: AccessReviewResourceAttributes[],
  impersonate?: ImpersonateKind,
) => [{ allowed: boolean; resourceAttributes: AccessReviewResourceAttributes }[], boolean];

const useMultipleAccessReviews: UseMultipleAccessReviews = (
  multipleResourceAttributes,
  impersonate,
) => {
  const [loading, setLoading] = useState(true);
  const [allowedResourceAttributes, setAllowedResourceAttributes] = useState([]);

  useEffect(() => {
    const promises = multipleResourceAttributes.map((resourceAttributes) =>
      checkAccess(resourceAttributes, impersonate),
    );

    Promise.all(promises)
      .then((values) => {
        setLoading(false);
        const updatedAllowedArr = values.map((result) => ({
          allowed: result.status.allowed,
          resourceAttributes: result.spec.resourceAttributes,
        }));
        setAllowedResourceAttributes(updatedAllowedArr);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('SelfSubjectAccessReview failed', e);
        setLoading(false);
      });
  }, [impersonate, multipleResourceAttributes]);

  return [allowedResourceAttributes, loading];
};

export default useMultipleAccessReviews;
