import { generateFilter } from './generate-filter';
import { FilterQuery, QueryOptions } from 'mongoose';
import { GenerateMongoArguments } from 'src/types';

export const GenerateMongo = <Args>(params: GenerateMongoArguments<Args>) => {
  // Imports
  const { fieldFilters, fieldRules, config } = params;

  //Define Variables
  let operator = `$${
    config?.operator ? config?.operator.toLowerCase() : 'or'
  }` as any;

  let filters: FilterQuery<any> = {};

  let options: QueryOptions = {
    sort: { createdAt: 1 },
    limit: 4,
  };

  // Handle Pagination
  if (config?.pagination) {
    if (config.pagination.createdAt) {
      filters['createdAt'] = {
        [config.pagination.reverse ? '$lt' : '$gt']: config.pagination
          .createdAt,
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

      for (const filter of fieldFiltersArray) {
        generateFilter({
          unparsedFieldFilter: filter,
          location,
          filters: filters,
          fieldRules,
          operator,
        });
      }
    } else {
      generateFilter({
        unparsedFieldFilter: fieldFilters[location],
        location,
        filters: filters,
        operator,
        fieldRules,
      });
    }
  }

  // Handle FieldRules
  if (fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      generateFilter({
        unparsedFieldFilter: fieldRule.fieldFilter,
        location: fieldRule.location.toString(),
        filters: filters,
        fieldRules,
        operator,
      });
    }
  }

  // Return Filters and Options
  if (Object.keys(filters).length) {
    return { filters, options };
  } else {
    return { filters: {}, options };
  }
};
