/**
 * Gallery alias for `MulticlusterResourceLink`.
 * Renders plain text instead of console/fleet navigation links.
 */
import type { FC, ReactNode } from 'react';

/** Props mirror production link; only `name` and `data-test` are rendered in scenes. */
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
