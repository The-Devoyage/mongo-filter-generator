import { Validate } from '../validate';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { GenerateFilterArguments } from '../../types';

export const toFilterQuery = <Arg>(
  params: GenerateFilterArguments
): FilterQuery<unknown> => {
  const { fieldRule } = params;
  let { fieldFilter, location } = params;

  if (fieldRule) {
    if (fieldRule) {
      if (fieldRule.disabled && Object.keys(fieldFilter ?? {}).length) {
        throw new Error(`MFG ERROR: Access to property "${location}" denied.`);
      }
      if (fieldRule.fieldFilter) {
        fieldFilter = fieldRule.fieldFilter;
        location = fieldRule.location as Extract<keyof Arg, string>;
      }
    }
  }

  // Convert to Mongo Filters
  if (Validate.isStringFieldFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'REGEX': {
        let search: RegExp | RegExp[] = [];
        if ('arrayOptions' in fieldFilter) {
          for (const str of fieldFilter.string as string[]) {
            const regex = new RegExp(`${str}`, 'i');
            search.push(regex);
          }
        } else {
          search = new RegExp(`${fieldFilter.string}`, 'i');
        }
        return search;
      }
      case 'MATCH': {
        return fieldFilter.string as FilterQuery<string>;
      }

      case 'OBJECTID': {
        let search: string | string[] = [];

        if ('arrayOptions' in fieldFilter) {
          for (const str of fieldFilter.string as string[]) {
            const isValidID = isValidObjectId(str);
            if (!isValidID) {
              throw new Error(`Invalid Mongo Object ID: ${str}.`);
            }
            search.push(str);
          }
        } else {
          const isValidID = isValidObjectId(fieldFilter.string);
          if (!isValidID) {
            throw new Error(`Invalid Mongo Object ID: ${fieldFilter.string}.`);
          }
          search = fieldFilter.string;
        }

        return search as FilterQuery<string>;
      }
    }
  } else if (Validate.isBooleanFieldFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'EQ': {
        return {
          $eq: fieldFilter.bool,
        };
      }
      case 'NE': {
        return {
          $ne: fieldFilter.bool,
        };
      }
    }
  } else if (Validate.isIntFieldFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LT': {
        return {
          $lt: fieldFilter.int,
        };
      }
      case 'GT': {
        return {
          $gt: fieldFilter.int,
        };
      }
      case 'EQ': {
        return {
          $eq: fieldFilter.int,
        };
      }
      case 'LTE': {
        return {
          $lte: fieldFilter.int,
        };
      }
      case 'GTE': {
        return {
          $gte: fieldFilter.int,
        };
      }
      case 'NE': {
        return {
          $ne: fieldFilter.int,
        };
      }
    }
  } else if (Validate.isDateFieldFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LTE': {
        const date = new Date(fieldFilter.date);
        return {
          $lte: date,
        };
      }
      case 'GTE': {
        const date = new Date(fieldFilter.date);
        return {
          $gte: date,
        };
      }
      case 'NE': {
        const date = new Date(fieldFilter.date);
        return {
          $ne: date,
        };
      }
      case 'EQ': {
        const date = new Date(fieldFilter.date);
        return {
          $eq: date,
        };
      }
      case 'GT': {
        const date = new Date(fieldFilter.date);
        return {
          $gt: date,
        };
      }
      case 'LT': {
        const date = new Date(fieldFilter.date);
        return {
          $lt: date,
        };
      }
    }
  } else {
    throw new Error(
      'MFG ERROR: Failed to convert field filter to mongo filter query.'
    );
  }
};
