import { generateFilter } from './generate-filter';
import { FilterQuery, QueryOptions } from 'mongoose';
import { GenerateMongoArguments } from '../types';

export const GenerateMongo = (params: GenerateMongoArguments) => {
  // Imports
  const { fieldFilters, fieldRules, config } = params;

  // const operator = `$${
  //   config?.operator ? config?.operator.toLowerCase() : 'or'
  // }` as any;

  const filter: FilterQuery<unknown> = {};

  const options: QueryOptions = {
    sort: { createdAt: 1 },
    limit: 4,
  };

  // Handle Pagination
  if (config?.pagination) {
    if (config.pagination.createdAt) {
      filter['createdAt'] = {
        [config.pagination.reverse ? '$lt' : '$gt']: new Date(
          config.pagination.createdAt
        ),
      };
    }
    if ('reverse' in config.pagination) {
      options.sort = {
        createdAt: config.pagination.reverse ? -1 : 1,
      };
    }
    if ('limit' in config.pagination) {
      options.limit = config.pagination.limit ?? 4;
    }
  }

  // Generate Filters for Arrays of Filters and Single Filters
  for (const location in fieldFilters) {
    if (Array.isArray(fieldFilters[location])) {
      const fieldFiltersArray: any = fieldFilters[location];

      for (const arrayFilter of fieldFiltersArray) {
        generateFilter({
          fieldFilter: arrayFilter,
          location,
          filter,
          fieldRules,
        });
      }
    } else {
      generateFilter({
        fieldFilter: fieldFilters[location],
        location,
        filter,
        fieldRules,
      });
    }
  }

  // Handle FieldRules
  if (fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      generateFilter({
        fieldFilter: fieldRule.fieldFilter,
        location: fieldRule.location.toString(),
        filter,
        fieldRules,
      });
    }
  }

  // Return Filters and Options
  if (Object.keys(filter).length) {
    return { filter, options };
  } else {
    return { filter: {}, options };
  }
};
