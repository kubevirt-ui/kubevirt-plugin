import { Location } from 'react-router-dom-v5-compat';

export const getTargetTab = (location: Location<any>) => location.hash?.slice(1); // Remove '#'
