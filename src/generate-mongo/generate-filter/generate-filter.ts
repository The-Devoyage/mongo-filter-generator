import { parseFieldFilter } from '../parse-filters';
import {
  isStringFilter,
  isIntFilter,
  isBooleanFilter,
  isDateFilter,
} from '../validate-filters';
import Mongoose, { FilterQuery, isValidObjectId } from 'mongoose';
import {
  GenerateFilterArguments,
  ArrayFilterByOptions,
  OperatorOptions,
} from '../../types';

export const generateFilter = <Arg>(params: GenerateFilterArguments) => {
  const { filter, fieldRules } = params;
  let { fieldFilter, location } = params;

  // Parse Field Filters
  const parsed = parseFieldFilter(fieldFilter, [location]);

  fieldFilter = parsed.fieldFilter;
  location = parsed.location;

  // Find overriding Field Rule
  const fieldRule = fieldRules?.find(f => f.location === location);

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

  // Check for array filters
  let arrayOptions: ArrayFilterByOptions | undefined;

  if (fieldFilter && 'arrayOptions' in fieldFilter) {
    arrayOptions = fieldFilter.arrayOptions;
  }

  // Convert to Mongo Filters
  if (isStringFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'REGEX': {
        let search: RegExp | RegExp[] = [];
        if (arrayOptions) {
          for (const str of fieldFilter.string as string[]) {
            const regex = new RegExp(`${str}`, 'i');
            search.push(regex);
          }
        } else {
          search = new RegExp(`${fieldFilter.string}`, 'i');
        }
        addFilter(filter, location, search, fieldFilter.operator, arrayOptions);
        break;
      }
      case 'MATCH': {
        addFilter(
          filter,
          location,
          fieldFilter.string,
          fieldFilter.operator,
          arrayOptions
        );
        break;
      }

      case 'OBJECTID': {
        let search: Mongoose.Types.ObjectId | Mongoose.Types.ObjectId[] = [];

        if (arrayOptions) {
          for (const str of fieldFilter.string as string[]) {
            const isValidID = isValidObjectId(str);
            if (!isValidID) {
              throw new Error(`Invalid Mongo Object ID: ${str}.`);
            }
            const _id = new Mongoose.Types.ObjectId(str);
            search.push(_id);
          }
        } else {
          const isValidID = isValidObjectId(fieldFilter.string);
          if (!isValidID) {
            throw new Error('Invalid Mongo Object ID.');
          }
          search = new Mongoose.Types.ObjectId(fieldFilter.string as string);
        }

        addFilter(filter, location, search, fieldFilter.operator, arrayOptions);
        break;
      }
    }
  } else if (isBooleanFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'EQ': {
        addFilter(
          filter,
          location,
          {
            $eq: fieldFilter.bool,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'NE': {
        addFilter(
          filter,
          location,
          {
            $ne: fieldFilter.bool,
          },
          fieldFilter.operator
        );
        break;
      }
    }
  } else if (isIntFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LT': {
        addFilter(
          filter,
          location,
          {
            $lt: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }

      case 'GT': {
        addFilter(
          filter,
          location,
          {
            $gt: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'EQ': {
        addFilter(
          filter,
          location,
          {
            $eq: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }

      case 'LTE': {
        addFilter(
          filter,
          location,
          {
            $lte: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }

      case 'GTE': {
        addFilter(
          filter,
          location,
          {
            $gte: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }

      case 'NE': {
        addFilter(
          filter,
          location,
          {
            $ne: fieldFilter.int,
          },
          fieldFilter.operator
        );
        break;
      }
    }
  } else if (isDateFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LTE': {
        addFilter(
          filter,
          location,
          {
            $lte: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'GTE': {
        addFilter(
          filter,
          location,
          {
            $gte: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'NE': {
        addFilter(
          filter,
          location,
          {
            $ne: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'EQ': {
        addFilter(
          filter,
          location,
          {
            $eq: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'GT': {
        addFilter(
          filter,
          location,
          {
            $gt: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
      case 'LT': {
        addFilter(
          filter,
          location,
          {
            $lt: fieldFilter.date,
          },
          fieldFilter.operator
        );
        break;
      }
    }
  }
  return filter;
};

const addFilter = (
  filter: FilterQuery<any>,
  location: string,
  newFilter: any,
  operator?: OperatorOptions | null,
  arrayOptions?: ArrayFilterByOptions
) => {
  const parsedOperator = `$${operator ? operator.toLowerCase() : 'or'}`;

  if (!arrayOptions) {
    if (parsedOperator in filter) {
      filter[parsedOperator] = [
        ...filter[parsedOperator],
        { [location]: newFilter },
      ];
    } else {
      filter[parsedOperator] = [{ [location]: newFilter }];
    }
  } else {
    if (parsedOperator in filter) {
      filter[parsedOperator] = [
        ...filter[parsedOperator],
        {
          [location]: {
            [`$${arrayOptions.toLowerCase()}`]: newFilter,
          },
        },
      ];
    } else {
      filter[parsedOperator] = [
        { [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter } },
      ];
    }
  }
};
