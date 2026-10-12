import { FLEET_TEMPLATES_PATH } from '../constants';

import { VMT_PATH_SEGMENT } from '../../views/templates/constants';

export const FLEET_TEMPLATES_DETAILS_PATH = `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/:name`;
export const FLEET_TEMPLATES_VMT_DETAILS_PATH = `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/${VMT_PATH_SEGMENT}/:name`;
