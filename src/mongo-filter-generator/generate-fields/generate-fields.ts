import { parseFilters } from '../parse-filters';
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
  OperatorEnum,
} from '../../types';

export const generateFields = <Arg>(params: GenerateFieldsArguments<Arg>) => {
  const { operator, arg, location, mongoFilter, fieldRules } = params;

  let { filtering, location: parsedLocation } = parseFilters(arg, [location]);

  const fieldRule = fieldRules?.find(
    f => f.location === parsedLocation ?? location
  );

  if (fieldRule) {
    if (fieldRule) {
      if (fieldRule.disabled && Object.keys(arg).length) {
        throw new Error(`MFG ERROR: Access to property "${location}" denied.`);
      }
      filtering = fieldRule.filter;
      parsedLocation = fieldRule.location as Extract<keyof Arg, string>;
    }
  }

  if (isStringFilter(filtering)) {
    switch (filtering.filter) {
      case 'REGEX':
        const regex = new RegExp(
          `${(filtering as StringFieldFilter).string}`,
          'i'
        );
        addField(mongoFilter, parsedLocation, { $regex: regex }, operator);
        break;
      case 'MATCH':
        addField(
          mongoFilter,
          parsedLocation,
          (filtering as StringFieldFilter).string,
          operator
        );
        break;

      case 'OBJECTID':
        addField(
          mongoFilter,
          parsedLocation,
          new Mongoose.Types.ObjectId((filtering as StringFieldFilter).string),
          operator
        );
        break;
    }
  } else if (isBooleanFilter(filtering)) {
    switch (filtering.filter) {
      case 'EQ':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $eq: (filtering as BooleanFieldFilter).bool,
          },
          operator
        );
        break;
      case 'NE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $ne: (filtering as BooleanFieldFilter).bool,
          },
          operator
        );
        break;
    }
  } else if (isIntFilter(filtering)) {
    switch (filtering.filter) {
      case 'LT':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $lt: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'GT':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $gt: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'EQ':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $eq: (filtering as IntFieldFilter)?.int,
          },
          operator
        );
        break;

      case 'LTE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $lte: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'GTE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $gte: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;

      case 'NE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $ne: (filtering as IntFieldFilter).int,
          },
          operator
        );
        break;
    }
  }
  return mongoFilter;
};

const addField = (
  mongoFilter: any,
  location: string,
  newField: any,
  operator: OperatorEnum
) => {
  mongoFilter[operator] = [...mongoFilter[operator], { [location]: newField }];
};
