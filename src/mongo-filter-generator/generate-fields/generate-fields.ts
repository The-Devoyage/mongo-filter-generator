import { parseFieldFilters } from '../parse-filters';
import {
  isStringFilter,
  isIntFilter,
  isBooleanFilter,
} from '../validate-filters';
import Mongoose from 'mongoose';
import {
  GenerateFieldsArguments,
  StringFieldFilter,
  BooleanFieldFilter,
  IntFieldFilter,
  OperatorOptions,
} from '../../types';

export const generateFields = <Arg>(params: GenerateFieldsArguments<Arg>) => {
  const {
    operator,
    unparsedFieldFilter,
    location,
    filters,
    fieldRules,
  } = params;

  let {
    filtering,
    location: parsedLocation,
  } = parseFieldFilters(unparsedFieldFilter, [location]);

  const fieldRule = fieldRules?.find(
    f => f.location === parsedLocation ?? location
  );

  if (fieldRule) {
    if (fieldRule) {
      if (fieldRule.disabled && Object.keys(unparsedFieldFilter).length) {
        throw new Error(`MFG ERROR: Access to property "${location}" denied.`);
      }
      filtering = fieldRule.fieldFilter;
      parsedLocation = fieldRule.location as Extract<keyof Arg, string>;
    }
  }

  if (isStringFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'REGEX':
        const regex = new RegExp(
          `${(filtering as StringFieldFilter).string}`,
          'i'
        );
        addField(filters, parsedLocation, { $regex: regex }, operator);
        break;
      case 'MATCH':
        addField(
          filters,
          parsedLocation,
          (filtering as StringFieldFilter).string,
          operator
        );
        break;

      case 'OBJECTID':
        addField(
          filters,
          parsedLocation,
          new Mongoose.Types.ObjectId((filtering as StringFieldFilter).string),
          operator
        );
        break;
    }
  } else if (isBooleanFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'EQ':
        addField(
          filters,
          parsedLocation,
          {
            $eq: (filtering as BooleanFieldFilter).bool,
          },
          operator
        );
        break;
      case 'NE':
        addField(
          filters,
          parsedLocation,
          {
            $ne: (filtering as BooleanFieldFilter).bool,
          },
          operator
        );
        break;
    }
  } else if (isIntFilter(filtering)) {
    switch (filtering.filterBy) {
      case 'LT':
        addField(
          filters,
          parsedLocation,
          {
            $lt: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'GT':
        addField(
          filters,
          parsedLocation,
          {
            $gt: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'EQ':
        addField(
          filters,
          parsedLocation,
          {
            $eq: (filtering as IntFieldFilter)?.int,
          },
          operator
        );
        break;

      case 'LTE':
        addField(
          filters,
          parsedLocation,
          {
            $lte: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'GTE':
        addField(
          filters,
          parsedLocation,
          {
            $gte: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'NE':
        addField(
          filters,
          parsedLocation,
          {
            $ne: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;
    }
  }
  return filters;
};

const addField = (
  filters: any,
  location: string,
  newField: any,
  operator: OperatorOptions
) => {
  filters[operator] = [...filters[operator], { [location]: newField }];
};
