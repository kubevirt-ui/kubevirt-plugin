import type { FC, ReactNode } from 'react';

type MulticlusterResourceLinkGalleryProps = {
  className?: string;
  cluster?: string;
  'data-test'?: string;
  inline?: boolean;
  name?: string;
  namespace?: string;
  children?: ReactNode;
};

/** Gallery stub: render resource name with `data-test` (fleet/console links are no-ops in scenes). */
const MulticlusterResourceLinkGallery: FC<MulticlusterResourceLinkGalleryProps> = ({
  className,
  'data-test': dataTest,
  name,
}) => (
  <span className={className} data-test={dataTest}>
    {name}
  </span>
);

export default MulticlusterResourceLinkGallery;
