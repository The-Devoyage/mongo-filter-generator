import { isFilter } from '../validate-filters';
import { MFGTypes } from '@src/mfg-types';

export const parseFieldFilters = (
  object: any,
  location: string[]
): {
  filtering: MFGTypes.Filters;
  location: string;
} => {
  const deepFilterSearch = (object: any): MFGTypes.Filters => {
    if (isFilter(object)) {
      return object;
    }

    for (const k in object) {
      location.push(k);
      const obj = object[k];
      if (typeof obj === 'object') {
        return deepFilterSearch(obj);
      }
    }
    return;
  };

  const filtering = deepFilterSearch(object);

  return { filtering, location: location.join('.') };
};
