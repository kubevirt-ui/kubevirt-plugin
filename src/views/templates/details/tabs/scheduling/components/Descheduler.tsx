import React from 'react';
import { isDeschedulerOn, useDeschedulerInstalled } from 'src/views/templates/utils';
import { DESCHEDULER_URL } from 'src/views/templates/utils/constants';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Descheduler')}
          bodyContent={
            <>
              {t(
                'The descheduler can be used to evict a running VM so that the VM can be rescheduled onto a more suitable node via a live migration.',
              )}
              <div className="margin-top">
                <Button
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  href={DESCHEDULER_URL}
                  target="_blank"
                  component="a"
                  iconPosition="right"
                  className="no-left-padding"
                >
                  {t('Learn more')}
                </Button>
              </div>
            </>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Descheduler')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        {isAdmin && !isDeschedulerInstalled ? (
          <Tooltip
            content={t(
              'To enable the descheduler, you must install the Kube Descheduler Operator from OperatorHub and enable one or more descheduler profiles.',
            )}
            position="right"
          >
            <MutedTextSpan text={isDeschedulerOn(template) ? t('ON') : t('OFF')} />
          </Tooltip>
        ) : (
          <DeschedulerModalButton template={template} editable={isEditable} />
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default Descheduler;
