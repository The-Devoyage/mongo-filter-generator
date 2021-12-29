import { generateFields } from './generate-fields';
import { GenerateMongoFilterArguments } from '../types';

export const GenerateMongoFilter = <Args>(
  params: GenerateMongoFilterArguments<Args>
) => {
  const { fieldFilters, fieldRules, config } = params;

  let operator = `$${
    config?.operator ? config?.operator.toLowerCase() : 'or'
  }` as any;

  let filters: Record<any, any> = {};

  let options: Record<any, any> = {
    sort: { createdAt: 1 },
    limit: 4,
  };

  if (config?.pagination) {
    if (config.pagination.createdAt) {
      filters['createdAt'] = {
        [config.pagination.reverse ? '$lte' : '$gte']: config.pagination
          .createdAt,
      };
    }
    if ('reverse' in config.pagination) {
      options.sort = {
        createdAt: config.pagination.reverse ? -1 : 1,
      };
    }
    if ('limit' in config.pagination) {
      options.limit = config.pagination.limit;
    }
  }

  for (const location in fieldFilters) {
    if (Array.isArray(fieldFilters[location])) {
      const fieldFiltersArray: any = fieldFilters[location];

      for (const filter of fieldFiltersArray) {
        generateFields({
          unparsedFieldFilter: filter,
          location,
          filters: filters,
          fieldRules,
          operator,
        });
      }
    } else {
      generateFields({
        unparsedFieldFilter: fieldFilters[location],
        location,
        filters: filters,
        operator,
        fieldRules,
      });
    }
  }

  if (fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      generateFields({
        unparsedFieldFilter: fieldRule.fieldFilter,
        location: fieldRule.location.toString(),
        filters: filters,
        fieldRules,
        operator,
      });
    }
  }

  if (Object.keys(filters).length) {
    return { filters, options };
  } else {
    return { filters: {}, options };
  }
};
