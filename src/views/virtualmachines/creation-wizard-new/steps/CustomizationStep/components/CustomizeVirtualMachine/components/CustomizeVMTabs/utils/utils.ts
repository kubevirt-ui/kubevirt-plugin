import { Location } from 'react-router';

export const getTargetTab = (location: Location<any>) => location.hash?.slice(1); // Remove '#'
