import React from 'react';

import { truncateMiddle } from '@console/internal/components/hooks';
import { RESOURCE_NAME_TRUNCATE_LENGTH } from '@console/shared';
import {
  createSvgIdUrl,
  useCombineRefs,
  useHover,
  useSize,
  WithDndDragProps,
} from '@patternfly/react-topology';

import SvgCircledIcon from './SvgCircledIcon';
import SvgDropShadowFilter from './SvgDropShadowFilter';
import SvgResourceIcon from './SvgResourceIcon';

interface SvgBoxedTextProps {
  children?: string;
  className?: string;
  paddingX?: number;
  paddingY?: number;
  x?: number;
  y?: number;
  cornerRadius?: number;
  kind?: string;
  typeIconClass?: string;
  typeIcon?: React.ReactNode;
  typeIconPadding?: number;
  truncate?: number;
  dragRef?: WithDndDragProps['dndDragRef'];
  // TODO remove with 2.0
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
}

const FILTER_ID = 'SvgBoxedTextDropShadowFilterId';

/**
 * Renders a `<text>` component with a `<rect>` box behind.
 */
const SvgBoxedText: React.FC<SvgBoxedTextProps> = ({
  children,
  className,
  paddingX = 0,
  paddingY = 0,
  cornerRadius = 4,
  x = 0,
  y = 0,
  kind,
  typeIconClass,
  typeIcon,
  typeIconPadding = 4,
  onMouseEnter,
  onMouseLeave,
  truncate = RESOURCE_NAME_TRUNCATE_LENGTH,
  dragRef,
  ...other
}) => {
  const [labelHover, labelHoverRef] = useHover();
  const [textSize, textRef] = useSize([children, className, labelHover]);
  const [iconSize, iconRef] = useSize([kind]);
  const iconSpace = kind && iconSize ? iconSize.width + paddingX : 0;
  const refs = useCombineRefs(dragRef, typeof truncate === 'number' ? labelHoverRef : undefined);
  const iconType = typeIconClass || typeIcon;
  const typedIconWidth = iconType && iconSize ? iconSize.height + typeIconPadding * 2 : 0;
  const midX = typedIconWidth ? x + typedIconWidth / 2 : x;

  return (
    <g className={className} ref={refs}>
      <SvgDropShadowFilter id={FILTER_ID} />
      {textSize && (
        <rect
          key={`rect-${FILTER_ID}`}
          filter={createSvgIdUrl(FILTER_ID)}
          x={midX - paddingX - textSize.width / 2 - iconSpace / 2 - (iconType ? 10 : 0)}
          width={textSize.width + paddingX * 2 + iconSpace + (iconType ? 10 : 0)}
          y={y - paddingY - textSize.height / 2}
          height={textSize.height + paddingY * 2}
          rx={cornerRadius}
          ry={cornerRadius}
        />
      )}
      {textSize && kind && (
        <SvgResourceIcon
          ref={iconRef}
          x={midX - textSize.width / 2 - paddingX / 2}
          y={y}
          kind={kind}
        />
      )}
      {textSize && iconSize && iconType && (
        <SvgCircledIcon
          x={midX - (textSize.width + iconSpace) / 2 - paddingX}
          y={y - iconSize.height + paddingY * 1.5}
          width={iconSize.height + paddingY}
          height={iconSize.height + paddingY}
          iconClass={typeIconClass}
          icon={typeIcon}
          padding={typeIconPadding}
        />
      )}
      <text
        {...other}
        ref={textRef}
        x={midX + iconSpace / 2}
        y={y}
        textAnchor="middle"
        dy="0.35em"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {truncate > 0
          ? labelHover
            ? children
            : truncateMiddle(children, { length: truncate })
          : children}
      </text>
    </g>
  );
};

export default SvgBoxedText;
