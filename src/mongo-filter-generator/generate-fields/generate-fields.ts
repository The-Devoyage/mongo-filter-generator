import { parseFilters } from '../parse-filters';
import {
  isStringFilter,
  isIntFilter,
  isBooleanFilter,
} from '../validate-filters';
import Mongoose from 'mongoose';
import {
  GenerateFieldsArguments,
  StringFilter,
  BooleanFilter,
  IntFilter,
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
        const regex = new RegExp(`${(filtering as StringFilter).string}`, 'i');
        addField(mongoFilter, parsedLocation, { $regex: regex }, operator);
        break;
      case 'MATCH':
        addField(
          mongoFilter,
          parsedLocation,
          (filtering as StringFilter).string,
          operator
        );
        break;

      case 'OBJECTID':
        addField(
          mongoFilter,
          parsedLocation,
          new Mongoose.Types.ObjectId((filtering as StringFilter).string),
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
            $eq: (filtering as BooleanFilter).bool,
          },
          operator
        );
        break;
      case 'NE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $ne: (filtering as BooleanFilter).bool,
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
            $lt: (filtering as IntFilter).int,
          },
          operator
        );
        break;

      case 'GT':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $gt: (filtering as IntFilter).int,
          },
          operator
        );
        break;

      case 'EQ':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $eq: (filtering as IntFilter)?.int,
          },
          operator
        );
        break;

      case 'LTE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $lte: (filtering as IntFilter).int,
          },
          operator
        );
        break;

      case 'GTE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $gte: (filtering as IntFilter).int,
          },
          operator
        );
        break;

      case 'NE':
        addField(
          mongoFilter,
          parsedLocation,
          {
            $ne: (filtering as IntFilter).int,
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
