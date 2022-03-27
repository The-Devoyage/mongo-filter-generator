import {
  StringFilterBase,
  BooleanFilterBase,
  IntFilterBase,
  DateFieldFilterBase,
  FieldFilter,
} from '../../types';

export const isValidFieldFilter = (object: unknown): object is FieldFilter => {
  if (typeof object === 'object') {
    const objectIsFilter =
      isStringFieldFilter(object) ||
      isBooleanFieldFilter(object) ||
      isIntFieldFilter(object) ||
      isDateFieldFilter(object);
    return objectIsFilter;
  } else {
    throw new Error(
      'Mongo Generator Error: No Filters Found, you must provide at least one valid filter within each property(Nested properties are valid).'
    );
  }
};

export const isStringFieldFilter = (
  object: unknown
): object is StringFilterBase => {
  if (typeof object === 'object' && object) {
    return 'string' in object;
  } else {
    return false;
  }
};

export const isBooleanFieldFilter = (
  object: unknown
): object is BooleanFilterBase => {
  if (typeof object === 'object' && object) {
    return 'bool' in object;
  } else {
    return false;
  }
};

export const isIntFieldFilter = (object: unknown): object is IntFilterBase => {
  if (typeof object === 'object' && object) {
    return 'int' in object;
  } else {
    return false;
  }
};

export const isDateFieldFilter = (
  object: unknown
): object is DateFieldFilterBase => {
  if (typeof object === 'object' && object) {
    return 'date' in object;
  } else {
    return false;
  }
};
