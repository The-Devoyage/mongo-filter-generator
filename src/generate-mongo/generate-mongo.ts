import { Convert } from './convert';
import { FilterQuery, QueryOptions } from 'mongoose';
import { GenerateMongoArguments } from '../types';
import { Parse } from './parse';
import { Modify } from './modify';

/**
 * Uses Field Filters and Field Config to generate Mongoose Filters and Options.
 * @returns -  Mongoose FilterQuery<unknown> as `filter` and Mongoose QueryOptions as `options`.
 **/

export const GenerateMongo = <DocumentType>(
  params: GenerateMongoArguments<DocumentType>
) => {
  const { fieldFilters, fieldRules, config } = params;

  let filter: FilterQuery<DocumentType & { createdAt?: Date }> = {};

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
  for (const rootLocation in fieldFilters) {
    if (Array.isArray(fieldFilters[rootLocation])) {
      const fieldFiltersArray = fieldFilters[rootLocation] as unknown[];

      for (const arrayFilter of fieldFiltersArray) {
        const { fieldFilter, location } = Parse.parseFieldFilter(arrayFilter, [
          rootLocation,
        ]);

        const fieldRule = fieldRules?.find(rule => rule.location === location);

        const generated = Convert.toFilterQuery({
          fieldFilter,
          location,
          fieldRule,
        });

        if (generated) {
          filter = Modify.Filter.addFilter({
            location,
            filter,
            newFilter: generated,
            groups: fieldFilter?.groups,
            operator: fieldFilter?.operator,
            arrayOptions:
              fieldFilter && 'arrayOptions' in fieldFilter
                ? fieldFilter.arrayOptions
                : undefined,
          });
        }
      }
    } else {
      const { fieldFilter, location } = Parse.parseFieldFilter(
        fieldFilters[rootLocation] as Record<string, unknown>,
        [rootLocation]
      );

      const fieldRule = fieldRules?.find(rule => rule.location === location);

      const generated = Convert.toFilterQuery({
        fieldFilter,
        location,
        fieldRule,
      });

      if (generated) {
        filter = Modify.Filter.addFilter({
          location,
          filter,
          newFilter: generated,
          groups: fieldFilter?.groups,
          operator: fieldFilter?.operator,
          arrayOptions:
            fieldFilter && 'arrayOptions' in fieldFilter
              ? fieldFilter.arrayOptions
              : undefined,
        });
      }
    }
  }

  // Handle FieldRules
  if (fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      const generated = Convert.toFilterQuery({
        fieldFilter: fieldRule.fieldFilter,
        location: fieldRule.location.toString(),
        fieldRule,
      });

      if (generated) {
        filter = Modify.Filter.addFilter({
          location: fieldRule.location.toString(),
          filter,
          newFilter: generated,
          groups: fieldRule.fieldFilter?.groups,
          operator: fieldRule.fieldFilter?.operator,
          arrayOptions:
            fieldRule.fieldFilter && 'arrayOptions' in fieldRule.fieldFilter
              ? fieldRule.fieldFilter.arrayOptions
              : undefined,
        });
      }
    }
  }

  // Return Filters and Options
  if (Object.keys(filter).length) {
    if (filter['$or']) {
      for (const group of filter['$or']) {
        if ('group' in group) {
          delete group.group;
        }
      }
    }
    if (filter['$and']) {
      for (const group of filter['$and']) {
        if ('group' in group) {
          delete group.group;
        }
      }
    }
    return { filter, options };
  } else {
    return { filter: {} as FilterQuery<DocumentType>, options };
  }
};
