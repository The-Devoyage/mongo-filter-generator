import { StringFilter, BooleanFilter, IntFilter } from '../../types';

export const isFilter = (object: any): boolean => {
  if (typeof object === 'object') {
    const objectIsFilter =
      isStringFilter(object) || isBooleanFilter(object) || isIntFilter(object);
    return objectIsFilter;
  } else {
    throw new Error(
      'MFG ERROR: No Filters Found, you must provide at least one valid filter within each property(Nested properties are valid).'
    );
  }
};

export const isStringFilter = (object: any): object is StringFilter => {
  if (typeof object === 'object') {
    return 'string' in object;
  } else {
    return false;
  }
};

export const isBooleanFilter = (object: any): object is BooleanFilter => {
  if (typeof object === 'object') {
    return 'bool' in object;
  } else {
    return false;
  }
};

export const isIntFilter = (object: any): object is IntFilter => {
  if (typeof object === 'object') {
    return 'int' in object;
  } else {
    return false;
  }
};
