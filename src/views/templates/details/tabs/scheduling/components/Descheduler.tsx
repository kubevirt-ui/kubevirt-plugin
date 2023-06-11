import React from 'react';
import { DESCHEDULER_URL } from 'src/views/templates/utils/constants';
import { isDeschedulerOn } from 'src/views/templates/utils/utils';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
  Tooltip,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import DeschedulerModalButton from './DeschedulerModalButton';

type DeschedulerProps = {
  template: V1Template;
};

const Descheduler: React.FC<DeschedulerProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const isDeschedulerInstalled = useDeschedulerInstalled();
  const isAdmin = useIsAdmin();
  const isEditable = isAdmin && isDeschedulerInstalled;

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <>
              {t(
                'The Descheduler can be used to evict a running VirtualMachine so that the VirtualMachine can be rescheduled onto a more suitable Node via a live migration.',
              )}
              <div className="margin-top">
                <Button
                  className="no-left-padding"
                  component="a"
                  href={DESCHEDULER_URL}
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="right"
                  target="_blank"
                  variant="link"
                >
                  {t('Learn more')}
                </Button>
              </div>
            </>
          }
          hasAutoWidth
          headerContent={t('Descheduler')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('Descheduler')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        {isAdmin && !isDeschedulerInstalled ? (
          <Tooltip
            content={t(
              'To enable the Descheduler, you must install the Kube Descheduler Operator from OperatorHub and enable one or more Descheduler profiles.',
            )}
            position="right"
          >
            <MutedTextSpan text={isDeschedulerOn(template) ? t('ON') : t('OFF')} />
          </Tooltip>
        ) : (
          <DeschedulerModalButton editable={isEditable} template={template} />
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Descheduler;
