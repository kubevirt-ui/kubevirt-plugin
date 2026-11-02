import { type FC, lazy, memo, Suspense } from 'react';

import { Icon } from '@patternfly/react-core';

import iconLoaders from './iconLoaders.generated';

const iconCache = new Map<string, ReturnType<typeof lazy>>();

/** Converts e.g. "pficon-atom" to "atom", "atom-icon" to "atom" */
const pfLabelToFileName = (pfLabel: string): string =>
  pfLabel.replace(/^(pficon-|pf-icon-|fa-)/, '').replace(/-icon$/, '');

/**
 * Dynamically loads and renders a PatternFly icon by its `instancetype.kubevirt.io/icon-pf` label value.
 * Each icon is loaded as an individual lazy chunk — only the requested icon is fetched at runtime.
 */
const DynamicPfIcon: FC<{ pfIconLabel: string }> = memo(({ pfIconLabel }) => {
  if (!pfIconLabel) return null;

  const fileName = pfLabelToFileName(pfIconLabel);

  if (!Object.hasOwn(iconLoaders, fileName)) return null;

  const loader = iconLoaders[fileName];

  if (typeof loader !== 'function') return null;

  // eslint-disable-next-line @eslint-react/static-components -- LazyIcon is created once per fileName and cached at module scope; it is not recreated on re-renders.
  let LazyIcon = iconCache.get(fileName);

  if (!LazyIcon) {
    LazyIcon = lazy(() => loader().catch(() => ({ default: (): null => null })));
    iconCache.set(fileName, LazyIcon);
  }

  return (
    <Suspense fallback={null}>
      <Icon>
        {/* eslint-disable-next-line @eslint-react/static-components */}
        <LazyIcon />
      </Icon>
    </Suspense>
  );
});

DynamicPfIcon.displayName = 'DynamicPfIcon';

export default DynamicPfIcon;
