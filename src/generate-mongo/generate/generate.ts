import { FilterQuery, isValidObjectId } from 'mongoose';
import { GenerateFilterArguments } from '../../types';
import mongoose from 'mongoose';
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
  StringArrayFieldFilter
} from "@the-devoyage/request-filter-language"

export const filterQuery = (
  params: GenerateFilterArguments
): FilterQuery<unknown> | undefined => {
  const { fieldFilter } = params;

  // Convert to Mongo Filters
  if (StringFieldFilterSchema.safeParse(fieldFilter).success) {
    switch (fieldFilter?.filterBy) {
      case 'REGEX': {
        let search: RegExp | RegExp[] = [];
        search = new RegExp(`${(fieldFilter as StringFieldFilter).string}`, 'i');
        return search;
      }
      case 'MATCH': {
        return (fieldFilter as StringFieldFilter).string as FilterQuery<string>;
      }

      case 'OBJECTID': {
        let search: mongoose.Types.ObjectId | mongoose.Types.ObjectId[] = [];

        const isValidID = isValidObjectId((fieldFilter as StringFieldFilter).string);
        if (!isValidID) {
          throw new Error(`Invalid Mongo Object ID: ${(fieldFilter as StringFieldFilter).string}.`);
        }
        const _id = new mongoose.Types.ObjectId((fieldFilter as StringFieldFilter).string as string);
        search = _id;

        return search;
      }
    }
  } else if (StringArrayFieldFilterSchema.safeParse(fieldFilter).success) {
    switch (fieldFilter?.filterBy) {
      case 'REGEX': {
        let search: RegExp | RegExp[] = [];
        if ('arrayOptions' in fieldFilter) {
          for (const str of fieldFilter.strings as string[]) {
            const regex = new RegExp(`${str}`, 'i');
            search.push(regex);
          }
        } else {
          search = new RegExp(`${fieldFilter.string}`, 'i');
        }
        return search;
      }
      case 'MATCH': {
        return (fieldFilter as StringArrayFieldFilter).strings;
      }

      case 'OBJECTID': {
        let search: mongoose.Types.ObjectId | mongoose.Types.ObjectId[] = [];

        if ('arrayOptions' in fieldFilter) {
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
    }

  } else if (BooleanFieldFilterSchema.safeParse(fieldFilter).success) {
    switch (fieldFilter?.filterBy) {
      case 'EQ': {
        return {
          $eq: (fieldFilter as BooleanFieldFilter).bool,
        };
      }
      case 'NE': {
        return {
          $ne: (fieldFilter as BooleanFieldFilter).bool,
        };
      }
    }
  } else if (IntFieldFilterSchema.safeParse(fieldFilter).success) {
    switch ((fieldFilter as IntFieldFilter).filterBy) {
      case 'LT': {
        return {
          $lt: (fieldFilter as IntFieldFilter).int,
        };
      }
      case 'GT': {
        return {
          $gt: (fieldFilter as IntFieldFilter).int,
        };
      }
      case 'EQ': {
        return {
          $eq: (fieldFilter as IntFieldFilter).int,
        };
      }
      case 'LTE': {
        return {
          $lte: (fieldFilter as IntFieldFilter).int,
        };
      }
      case 'GTE': {
        return {
          $gte: (fieldFilter as IntFieldFilter).int,
        };
      }
      case 'NE': {
        return {
          $ne: (fieldFilter as IntFieldFilter).int,
        };
      }
    }
  } else if (DateFieldFilterSchema.safeParse(fieldFilter).success) {
    const date = new Date((fieldFilter as DateFieldFilter).date);

    switch (fieldFilter?.filterBy) {
      case 'LTE': {
        return {
          $lte: date,
        };
      }
      case 'GTE': {
        return {
          $gte: date,
        };
      }
      case 'NE': {
        return {
          $ne: date,
        };
      }
      case 'EQ': {
        return {
          $eq: date,
        };
      }
      case 'GT': {
        return {
          $gt: date,
        };
      }
      case 'LT': {
        return {
          $lt: date,
        };
      }
    }
  } else {
    return;
  }
  return undefined
};

