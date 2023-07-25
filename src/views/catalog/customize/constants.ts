import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const NAME_INPUT_FIELD = 'NAME';

export const INSTALLATION_CDROM_NAME = 'installation-cdrom';

export const INSTALLATION_CDROM_DISK: V1Disk = {
  bootOrder: 1,
  cdrom: {
    bus: 'sata',
  },
  name: INSTALLATION_CDROM_NAME,
};
export const CUSTOMIZE_TEMPLATE_TITLE = t('Customize template parameters');
