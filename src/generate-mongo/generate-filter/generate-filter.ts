import { parseFieldFilters } from '../parse-filters';
import {
  isStringFilter,
  isIntFilter,
  isBooleanFilter,
} from '../validate-filters';
import Mongoose, { FilterQuery, isValidObjectId } from 'mongoose';
import {
  GenerateFilterArguments,
  ArrayFilterByOptions,
  OperatorOptions,
} from '@src/types';

export const generateFilter = <Arg>(params: GenerateFilterArguments<Arg>) => {
  const {
    operator,
    unparsedFieldFilter,
    location,
    filters,
    fieldRules,
  } = params;

  // Parse Field Filters
  let {
    filtering,
    location: parsedLocation,
  } = parseFieldFilters(unparsedFieldFilter, [location]);

  // Find overriding Field Rule
  const fieldRule = fieldRules?.find(
    f => f.location === parsedLocation ?? location
  );

  if (fieldRule) {
    if (fieldRule) {
      if (fieldRule.disabled && Object.keys(unparsedFieldFilter).length) {
        throw new Error(`MFG ERROR: Access to property "${location}" denied.`);
      }
      if (fieldRule.fieldFilter) {
        filtering = fieldRule.fieldFilter;
        parsedLocation = fieldRule.location as Extract<keyof Arg, string>;
      }
    }
  }

  // Check for array filters
  let arrayOptions: ArrayFilterByOptions | undefined;

  if (filtering && 'arrayOptions' in filtering) {
    arrayOptions = filtering.arrayOptions;
  }

  // Convert to Mongo Filters
  if (isStringFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'REGEX': {
        let search: RegExp | RegExp[] = [];
        if (arrayOptions) {
          for (const str of filtering.string as string[]) {
            const regex = new RegExp(`${str}`, 'i');
            search.push(regex);
          }
        } else {
          search = new RegExp(`${filtering.string}`, 'i');
        }
        addFilter(filters, parsedLocation, search, operator, arrayOptions);
        break;
      }
      case 'MATCH': {
        addFilter(
          filters,
          parsedLocation,
          filtering.string,
          operator,
          arrayOptions
        );
        break;
      }

      case 'OBJECTID': {
        let search: Mongoose.Types.ObjectId | Mongoose.Types.ObjectId[] = [];

        if (arrayOptions) {
          for (const str of filtering.string as string[]) {
            const isValidID = isValidObjectId(str);
            if (!isValidID) {
              throw new Error(`Invalid Mongo Object ID: ${str}.`);
            }
            const _id = new Mongoose.Types.ObjectId(str);
            search.push(_id);
          }
        } else {
          const isValidID = isValidObjectId(filtering.string);
          if (!isValidID) {
            throw new Error('Invalid Mongo Object ID.');
          }
          search = new Mongoose.Types.ObjectId(filtering.string as string);
        }

        addFilter(filters, parsedLocation, search, operator, arrayOptions);
        break;
      }
    }
  } else if (isBooleanFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'EQ': {
        addFilter(
          filters,
          parsedLocation,
          {
            $eq: filtering.bool,
          },
          operator
        );
        break;
      }
      case 'NE': {
        addFilter(
          filters,
          parsedLocation,
          {
            $ne: filtering.bool,
          },
          operator
        );
        break;
      }
    }
  } else if (isIntFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'LT': {
        addFilter(
          filters,
          parsedLocation,
          {
            $lt: filtering.int,
          },
          operator
        );
        break;
      }

      case 'GT': {
        addFilter(
          filters,
          parsedLocation,
          {
            $gt: filtering.int,
          },
          operator
        );
        break;
      }
      case 'EQ': {
        addFilter(
          filters,
          parsedLocation,
          {
            $eq: filtering.int,
          },
          operator
        );
        break;
      }

      case 'LTE': {
        addFilter(
          filters,
          parsedLocation,
          {
            $lte: filtering.int,
          },
          operator
        );
        break;
      }

      case 'GTE': {
        addFilter(
          filters,
          parsedLocation,
          {
            $gte: filtering.int,
          },
          operator
        );
        break;
      }

      case 'NE': {
        addFilter(
          filters,
          parsedLocation,
          {
            $ne: filtering.int,
          },
          operator
        );
        break;
      }
    }
  }
  return filters;
};

const addFilter = (
  filters: FilterQuery<any>,
  location: string,
  newFilter: any,
  operator: OperatorOptions,
  arrayOptions?: ArrayFilterByOptions
) => {
  if (!arrayOptions) {
    if (operator in filters) {
      filters[operator] = [...filters[operator], { [location]: newFilter }];
    } else {
      filters[operator] = [{ [location]: newFilter }];
    }
  } else {
    if (operator in filters) {
      filters[operator] = [
        ...filters[operator],
        {
          [location]: {
            [`$${arrayOptions.toLowerCase()}`]: newFilter,
          },
        },
      ];
    } else {
      filters[operator] = [
        { [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter } },
      ];
    }
  }
};
