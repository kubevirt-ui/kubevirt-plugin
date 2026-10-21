import type { FC } from 'react';

import { Stack } from '@patternfly/react-core';

import VirtIODriversDownloadsAlert from './components/VirtIODriversDownloadsAlert/VirtIODriversDownloadsAlert';
import VirtIODriversSection from './components/VirtIODriversSection/VirtIODriversSection';

const DownloadsTab: FC = () => {
  return (
    <Stack hasGutter>
      <VirtIODriversDownloadsAlert />
      <VirtIODriversSection />
    </Stack>
  );
};

export default DownloadsTab;
