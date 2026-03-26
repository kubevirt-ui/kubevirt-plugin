import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../utils/constants/constants';
import { VIRT_SECTION_ID } from '../views/navigation/constants';

import { VIRT_PERSPECTIVE_SUFFIX } from './constants';

export const suffixId = (id: string): string => `${id}${VIRT_PERSPECTIVE_SUFFIX}`;

const suffixRef = (ref: string | string[]): string | string[] =>
  Array.isArray(ref) ? ref.map(suffixId) : suffixId(ref);

/**
 * Adapts navigation extensions from the classic/admin perspective
 * for use in the Virtualization perspective by:
 * - Filtering out `virtualization` section item
 * - Suffixing all nav IDs (`id`, `insertAfter`, `insertBefore`) with `-virt-perspective`
 * - Replacing `section` scope with `perspective`
 * - Removing ordering references that point to the section header
 * @param items - The navigation extension items to adapt
 */
export const adaptNavForPerspective = (items: EncodedExtension[]): EncodedExtension[] =>
  items
    .filter((item) => item.properties.id !== VIRT_SECTION_ID)
    .map((item) => {
      const props = { ...item.properties };

      if (props.id) {
        props.id = suffixId(props.id as string);
      }

      if (props.insertAfter) {
        if (props.insertAfter === VIRT_SECTION_ID) {
          delete props.insertAfter;
        } else {
          props.insertAfter = suffixRef(props.insertAfter as string | string[]);
        }
      }

      if (props.insertBefore) {
        if (props.insertBefore === VIRT_SECTION_ID) {
          delete props.insertBefore;
        } else {
          props.insertBefore = suffixRef(props.insertBefore as string | string[]);
        }
      }

      delete props.section;
      props.perspective = PERSPECTIVES.VIRTUALIZATION;

      return { ...item, properties: props };
    });
