import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_IMAGE_LINKS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { urlSourceHelperTextMapper } from './utils/constants';
import { DiskSourceUrlInputProps } from './utils/types';

const URLSourceHelperText: FC<DiskSourceUrlInputProps> = ({ os }) => {
  const { t } = useKubevirtTranslation();
  const { afterLabelText, beforeLabelText, label } =
    urlSourceHelperTextMapper[os || OS_NAME_TYPES.fedora];

  // TODO: Replace three-part concatenation with single interpolated translation key
  // to avoid i18n concatenation issues (e.g., t('Example: For {{os}}, visit the {{link}} and copy...'))
  return (
    <>
      {t(beforeLabelText)}
      <strong>
        <Link rel="noreferrer" target="_blank" to={OS_IMAGE_LINKS[os || OS_NAME_TYPES.fedora]}>
          {t(label)}
        </Link>
      </strong>
      {t(afterLabelText)}
    </>
  );
};

export default URLSourceHelperText;
