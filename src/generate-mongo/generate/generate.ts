import { FilterQuery, isValidObjectId } from "mongoose";
import { GenerateFilterArguments } from "../../types";
import mongoose from "mongoose";
import {
  StringFieldFilterSchema,
  BooleanFieldFilterSchema,
  IntFieldFilterSchema,
  StringArrayFieldFilterSchema,
  DateFieldFilterSchema,
  DateFieldFilter,
  IntFieldFilter,
  BooleanFieldFilter,
  StringFieldFilter,
  StringArrayFieldFilter,
} from "@the-devoyage/request-filter-language";
import { Logger } from "pino";

export const filterQuery = (
  params: GenerateFilterArguments,
  logger: Logger
): FilterQuery<unknown> | undefined => {
  const { fieldFilter } = params;
  logger.info("Generating Filter Query");

  if (StringFieldFilterSchema.safeParse(fieldFilter).success) {
    logger.info("Found String Field Filter.");
    logger.debug({ fieldFilter });
    switch (fieldFilter?.filterBy) {
      case "REGEX": {
        logger.info("String Filter By Regex");
        let search: RegExp | RegExp[] = [];
        search = new RegExp(
          `${(fieldFilter as StringFieldFilter).string}`,
          "i"
        );
        logger.debug({ search });
        return search;
      }

      case "OBJECTID": {
        logger.info("String Filter By ObjectId");
        let search: mongoose.Types.ObjectId | mongoose.Types.ObjectId[] = [];

        const isValidID = isValidObjectId(
          (fieldFilter as StringFieldFilter).string
        );
        if (!isValidID) {
          throw new Error(
            `Invalid Mongo Object ID: ${
              (fieldFilter as StringFieldFilter).string
            }.`
          );
        }
        const _id = new mongoose.Types.ObjectId(
          (fieldFilter as StringFieldFilter).string as string
        );
        search = _id;
        logger.debug({ search });

        return search;
      }

      case "MATCH":
      default: {
        logger.info("String Filter By Match");
        return (fieldFilter as StringFieldFilter).string as FilterQuery<string>;
      }
    }
  } else if (StringArrayFieldFilterSchema.safeParse(fieldFilter).success) {
    switch (fieldFilter?.filterBy) {
      case "REGEX": {
        let search: RegExp | RegExp[] = [];
        if ("arrayOptions" in fieldFilter) {
          for (const str of fieldFilter.strings as string[]) {
            const regex = new RegExp(`${str}`, "i");
            search.push(regex);
          }
        } else {
          search = new RegExp(`${fieldFilter.string}`, "i");
        }
        return search;
      }
      case "OBJECTID": {
        let search: mongoose.Types.ObjectId | mongoose.Types.ObjectId[] = [];

        if ("arrayOptions" in fieldFilter) {
          for (const str of fieldFilter.strings) {
            const isValidID = isValidObjectId(str);
            if (!isValidID) {
              throw new Error(`Invalid Mongo Object ID: ${str}.`);
            }
            const _id = new mongoose.Types.ObjectId(str);
            search.push(_id);
          }
        } else {
          const isValidID = isValidObjectId(fieldFilter.string);
          if (!isValidID) {
            throw new Error(`Invalid Mongo Object ID: ${fieldFilter.string}.`);
          }
          const _id = new mongoose.Types.ObjectId(fieldFilter.string as string);
          search = _id;
        }

        return search;
      }

      case "MATCH":
      default: {
        logger.info("Found default filterBy, MATCH.");
        return (fieldFilter as StringArrayFieldFilter).strings;
      }
    }
  } else if (BooleanFieldFilterSchema.safeParse(fieldFilter).success) {
    logger.info("Found Boolean Field Filter.");
    switch (fieldFilter?.filterBy) {
      case "NE": {
        logger.info("Boolean Filter by NE");
        return {
          $ne: (fieldFilter as BooleanFieldFilter).bool,
        };
      }
      case "EQ":
      default: {
        logger.info("Boolean Filter by EQ");
        return {
          $eq: (fieldFilter as BooleanFieldFilter).bool,
        };
      }
    }
  } else if (IntFieldFilterSchema.safeParse(fieldFilter).success) {
    switch ((fieldFilter as IntFieldFilter).filterBy) {
      case "LT": {
        logger.info("Int Filter by LT");
        return {
          $lt: (fieldFilter as IntFieldFilter).int,
        };
      }
      case "GT": {
        logger.info("Int Filter by GT");
        return {
          $gt: (fieldFilter as IntFieldFilter).int,
        };
      }
      case "LTE": {
        logger.info("Int Filter by LTE");
        return {
          $lte: (fieldFilter as IntFieldFilter).int,
        };
      }
      case "GTE": {
        logger.info("Int Filter by GTE");
        return {
          $gte: (fieldFilter as IntFieldFilter).int,
        };
      }
      case "NE": {
        logger.info("Int Filter by NE");
        return {
          $ne: (fieldFilter as IntFieldFilter).int,
        };
      }
      case "EQ":
      default: {
        logger.info("Int Filter by EQ");
        return {
          $eq: (fieldFilter as IntFieldFilter).int,
        };
      }
    }
  } else if (DateFieldFilterSchema.safeParse(fieldFilter).success) {
    const date = new Date((fieldFilter as DateFieldFilter).date);
    logger.info("Date Field Filter Found.");

    switch (fieldFilter?.filterBy) {
      case "LTE": {
        logger.info("Date Filter By LTE.");
        return {
          $lte: date,
        };
      }
      case "GTE": {
        logger.info("Date Filter By GTE.");
        return {
          $gte: date,
        };
      }
      case "NE": {
        logger.info("Date Filter By NE.");
        return {
          $ne: date,
        };
      }
      case "EQ": {
        logger.info("Date Filter By EQ.");
        return {
          $eq: date,
        };
      }
      case "GT": {
        logger.info("Date Filter By GTE.");
        return {
          $gt: date,
        };
      }
      case "LT": {
        logger.info("Date Filter By LT.");
        return {
          $lt: date,
        };
      }
    }
  } else {
    return;
  }
  return undefined;
};
