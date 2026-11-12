import { type FC, type ReactNode } from 'react';

import UploadProgressLinks from '@kubevirt-utils/hooks/useInFlightToast/shared/progressToastUI/UploadProgressLinks';
import { type UploadSuccessLink } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';

type WatchedResourceSuccessToastContentProps = {
  content?: ReactNode;
  links?: UploadSuccessLink[];
  navigate: (path: string) => void;
};

const WatchedResourceSuccessToastContent: FC<WatchedResourceSuccessToastContentProps> = ({
  content,
  links = [],
  navigate,
}) => {
  if (isEmpty(content) && isEmpty(links)) {
    return null;
  }

  return (
    <Stack hasGutter>
      {!isEmpty(content) && <StackItem>{content}</StackItem>}
      {!isEmpty(links) && (
        <StackItem>
          <UploadProgressLinks links={links} navigate={navigate} />
        </StackItem>
      )}
    </Stack>
  );
};

export default WatchedResourceSuccessToastContent;
