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
        addFilter({
          filter,
          location,
          newFilter: search,
          operator: fieldFilter.operator,
          arrayOptions,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'MATCH': {
        addFilter({
          filter,
          location,
          newFilter: fieldFilter.string,
          operator: fieldFilter.operator,
          arrayOptions,
          groups: fieldFilter.groups,
        });
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

        addFilter({
          filter,
          location,
          newFilter: search,
          operator: fieldFilter.operator,
          arrayOptions,
          groups: fieldFilter.groups,
        });
        break;
      }
    }
  } else if (isBooleanFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'EQ': {
        addFilter({
          filter,
          location,
          newFilter: {
            $eq: fieldFilter.bool,
          },
          operator: fieldFilter.operator,
          arrayOptions,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'NE': {
        addFilter({
          filter,
          location,
          newFilter: {
            $ne: fieldFilter.bool,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
    }
  } else if (isIntFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LT': {
        addFilter({
          filter,
          location,
          newFilter: {
            $lt: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }

      case 'GT': {
        addFilter({
          filter,
          location,
          newFilter: {
            $gt: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'EQ': {
        addFilter({
          filter,
          location,
          newFilter: {
            $eq: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }

      case 'LTE': {
        addFilter({
          filter,
          location,
          newFilter: {
            $lte: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }

      case 'GTE': {
        addFilter({
          filter,
          location,
          newFilter: {
            $gte: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }

      case 'NE': {
        addFilter({
          filter,
          location,
          newFilter: {
            $ne: fieldFilter.int,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
    }
  } else if (isDateFilter(fieldFilter)) {
    switch (fieldFilter.filterBy) {
      case 'LTE': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $lte: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'GTE': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $gte: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'NE': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $ne: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'EQ': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $eq: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'GT': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $gt: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
      case 'LT': {
        const date = new Date(fieldFilter.date);
        addFilter({
          filter,
          location,
          newFilter: {
            $lt: date,
          },
          operator: fieldFilter.operator,
          groups: fieldFilter.groups,
        });
        break;
      }
    }
  }
  return filter;
};

const addFilter = (params: {
  filter: FilterQuery<any>;
  location: string;
  newFilter: any;
  operator?: OperatorOptions | null;
  arrayOptions?: ArrayFilterByOptions;
  groups?: string[];
}) => {
  const {
    filter,
    location,
    newFilter,
    operator,
    arrayOptions,
    groups,
  } = params;
  const parsedOperator = `$${operator ? operator.toLowerCase() : 'or'}`;

  if (!arrayOptions) {
    if (groups) {
      for (const group of groups) {
        const operatorType = group.includes('.or')
          ? '$or'
          : group.includes('.and')
          ? '$and'
          : null;

        if (!operatorType) {
          throw Error(
            'Group names must contain `.and` or `.or` in order to categorize the filter type and function.'
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            existing => existing.group === group
          );

          if (updating) {
            updating[parsedOperator] = [
              ...(updating[parsedOperator] ?? []),
              { [location]: newFilter },
            ];
          } else {
            filter[operatorType] = [
              ...(filter[operatorType] ?? []),
              {
                [parsedOperator]: [{ [location]: newFilter }],
                group,
              },
            ];
          }
        } else {
          filter[operatorType] = [
            {
              [parsedOperator]: [{ [location]: newFilter }],
              group,
            },
          ];
        }
      }
    } else if (parsedOperator in filter) {
      filter[parsedOperator] = [
        ...filter[parsedOperator],
        { [location]: newFilter },
      ];
    } else {
      filter[parsedOperator] = [{ [location]: newFilter }];
    }
  } else {
    if (groups) {
      for (const group of groups) {
        const operatorType = group.includes('.or')
          ? '$or'
          : group.includes('.and')
          ? '$and'
          : null;

        if (!operatorType) {
          throw Error(
            'Group names must contain `.and` or `.or` in order to categorize the filter type and function.'
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            existing => existing.group === group
          );

          if (updating) {
            updating[parsedOperator] = [
              ...(updating[parsedOperator] ?? []),
              {
                [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter },
              },
            ];
          } else {
            filter[operatorType] = [
              ...(filter[operatorType] ?? []),
              {
                [parsedOperator]: [
                  {
                    [location]: {
                      [`$${arrayOptions.toLowerCase()}`]: newFilter,
                    },
                  },
                ],
                group,
              },
            ];
          }
        } else {
          filter[operatorType] = [
            {
              [parsedOperator]: [
                {
                  [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter },
                },
              ],
              group,
            },
          ];
        }
      }
    } else if (parsedOperator in filter) {
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
