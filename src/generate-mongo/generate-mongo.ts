import { Generate } from "./generate";
import { FilterQuery, QueryOptions } from "mongoose";
import { GenerateMongoArguments } from "../types";
import { Modify } from "./modify";
import { parseFieldFilters } from "@the-devoyage/request-filter-language";
import { startLogger } from "../logger";
import { Level } from "pino";

/**
 * Uses Field Filters and Field Config to generate Mongoose Filters and Options.
 * @returns -  Mongoose FilterQuery<unknown> as `filter` and Mongoose QueryOptions as `options`.
 **/

export const GenerateMongo = <DocumentType>(
  params: GenerateMongoArguments<DocumentType>,
  settings?: { logLevel: Level }
) => {
  const logger = startLogger({ level: settings?.logLevel });
  logger.info("Generating Mongoose Filters");

  const { fieldFilters, config } = params;
  let { fieldRules } = params;

  let filter: FilterQuery<DocumentType & { createdAt?: Date }> = {};

  const options: QueryOptions = {
    sort: { createdAt: 1 },
    limit: 4,
  };

  if (config?.pagination) {
    logger.info("Setting Pagination.");

    logger.info("Checking date key.");
    const dateKey = config.pagination.date_key ?? "createdAt";
    logger.debug({ date_key: dateKey });

    filter[dateKey as keyof FilterQuery<DocumentType>] = {
      [config.pagination.reverse ? "$lt" : "$gt"]: new Date(
        config.pagination.date_cursor ?? ""
      ),
    };
    logger.info("Date key added to filter.");
    logger.debug({ filter });

    if ("reverse" in config.pagination) {
      logger.info("Reverse Pagination.");
      options.sort = {
        createdAt: config.pagination.reverse ? -1 : 1,
      };
      logger.debug({ options });
    }

    if ("limit" in config.pagination) {
      logger.info("Setting limit.");
      options.limit = config.pagination.limit ?? 4;
      logger.debug({ options });
    }

    logger.debug("Pagination generated. Options: ", options);
  }

  logger.info("Parsing locations");
  for (const rootLocation in fieldFilters) {
    logger.info("Root location found.");
    logger.debug({ rootLocation });

    logger.info("Parsing field filters from root location.");
    const filtersAndLocations = parseFieldFilters(
      fieldFilters[rootLocation],
      rootLocation
    );
    logger.debug({ filtersAndLocations });

    for (const fl of filtersAndLocations) {
      logger.info("Field Filter Found.");
      logger.debug({ fl });

      const fieldRule = fieldRules?.find(
        (rule) => rule.location === fl.location
      );

      if (fieldRule) {
        logger.info("Found field rule.");
        logger.debug({ fieldRule });

        logger.info("Applying Rule");
        const ruleApplied = Modify.FieldFilter.applyFieldRule(
          fieldRule,
          fl.fieldFilter,
          fieldRules ?? []
        );
        logger.debug({ filter });

        logger.info("Updating remaining field rules.");
        fieldRules = ruleApplied.updatedFieldRules;
        logger.debug({ fieldRules });

        if (ruleApplied.fieldFilter) {
          logger.info("Applying rule.");
          fl.fieldFilter = ruleApplied.fieldFilter;
          logger.debug({ ruleApplied });
        }

        logger.info("Field filter updated.");
        logger.debug({ fl });
      }

      logger.info("Generate filter query.");
      const generated = Generate.filterQuery(
        {
          fieldFilter: fl.fieldFilter,
        },
        logger
      );

      if (generated) {
        logger.info("Filter query generated.");
        logger.debug({ generated });

        logger.info("Updating filter.");
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

        logger.info("Filter updated.");
        logger.debug({ filter });
      } else {
        logger.warn("Failed to generate found filter.");
        logger.debug({ generated });
      }
    }
  }

  // Handle FieldRules
  if (fieldRules?.length) {
    logger.info("Handling remaining field rules.");
    for (const fieldRule of fieldRules) {
      logger.info("Parsing field rule.");
      logger.debug({ "Field rule": fieldRule });

      logger.info("Generating filter query.");
      const generated = Generate.filterQuery(
        {
          fieldFilter: fieldRule.fieldFilter,
        },
        logger
      );

      !generated && logger.error("Failed to generate filter query.", generated);

      if (generated) {
        logger.debug({ "Generated filter query": generated });

        logger.info("Modifying filter.");
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

        logger.debug({ "Modified filter": filter });
      }
    }
  }

  // Return Filters and Options
  if (Object.keys(filter).length) {
    logger.info("Finalizing filter.");
    filter = Modify.Filter.transformGroups(filter);
    logger.debug({ "Modified filter": filter });
    const result = { filter, options };
    logger.debug({ "Filters finalized": result });

    return result;
  } else {
    logger.info("Returning empty filter.", filter);
    const result = { filter: {} as FilterQuery<DocumentType>, options };
    logger.debug({ result });

    return result;
  }
};
