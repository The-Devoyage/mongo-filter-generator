import { Generate } from "./generate";
import { FilterQuery, QueryOptions } from "mongoose";
import { GenerateMongoArguments } from "../types";
import { Modify } from "./modify";
import { parseFieldFilters } from "@the-devoyage/request-filter-language";

/**
 * Uses Field Filters and Field Config to generate Mongoose Filters and Options.
 * @returns -  Mongoose FilterQuery<unknown> as `filter` and Mongoose QueryOptions as `options`.
 **/

export const GenerateMongo = <DocumentType>(
  params: GenerateMongoArguments<DocumentType>
) => {
  const { fieldFilters, config } = params;
  let { fieldRules } = params;

  let filter: FilterQuery<DocumentType & { createdAt?: Date }> = {};

  const options: QueryOptions = {
    sort: { createdAt: 1 },
    limit: 4,
  };

  // Handle Pagination
  if (config?.pagination) {
    const dateKey = config.pagination.date_key ?? "createdAt"
    filter[dateKey as keyof FilterQuery<DocumentType>] = {
      [config.pagination.reverse ? "$lt" : "$gt"]: new Date(
        config.pagination.date_cursor ?? ""
      ),
    }
    if ("reverse" in config.pagination) {
      options.sort = {
        createdAt: config.pagination.reverse ? -1 : 1,
      };
    }
    if ("limit" in config.pagination) {
      options.limit = config.pagination.limit ?? 4;
    }
  }

  // Generate Filters for Arrays of Filters and Single Filters
  for (const rootLocation in fieldFilters) {
    const filtersAndLocations = parseFieldFilters(fieldFilters[rootLocation], rootLocation)

    for (const fl of filtersAndLocations) {
      const fieldRule = fieldRules?.find(
        (rule) => rule.location === fl.location
      );

      if (fieldRule) {
        const ruleApplied = Modify.FieldFilter.applyFieldRule(
          fieldRule,
          fl.fieldFilter,
          fieldRules ?? []
        );
        fieldRules = ruleApplied.updatedFieldRules;

        if (ruleApplied.fieldFilter) {
          fl.fieldFilter = ruleApplied.fieldFilter;
        }
      }

      const generated = Generate.filterQuery({
        fieldFilter: fl.fieldFilter,
      });

      if (generated) {
        filter = Modify.Filter.addFilter({
          location: fl.location,
          filter,
          newFilter: generated,
          groups: fl.fieldFilter?.groups,
          operator: fl.fieldFilter?.operator,
          arrayOptions:
            fl.fieldFilter && "arrayOptions" in fl.fieldFilter
              ? fl.fieldFilter.arrayOptions
              : undefined,
        });
      }
    }
  }

  // Handle FieldRules
  if (fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      const generated = Generate.filterQuery({
        fieldFilter: fieldRule.fieldFilter,
      });

      if (generated) {
        filter = Modify.Filter.addFilter({
          location: fieldRule.location,
          filter,
          newFilter: generated,
          groups: fieldRule.fieldFilter?.groups,
          operator: fieldRule.fieldFilter?.operator,
          arrayOptions:
            fieldRule.fieldFilter && "arrayOptions" in fieldRule.fieldFilter
              ? fieldRule.fieldFilter.arrayOptions
              : undefined,
        });
      }
    }
  }

  // Return Filters and Options
  if (Object.keys(filter).length) {
    filter = Modify.Filter.transformGroups(filter);
    return { filter, options };
  } else {
    return { filter: {} as FilterQuery<DocumentType>, options };
  }
};
