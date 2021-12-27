import { generateFields } from './generate-fields';
import { GenerateMongoFilterArguments } from '../types';

export const GenerateMongoFilter = <Args>(
  params: GenerateMongoFilterArguments<Args>
) => {
  const { modelFilters, fieldRules, filterConfig } = params;

  let operator = `$${filterConfig?.operator.toLowerCase() ?? 'or'}` as any;
  let mongoFilter: any = {
    [operator]: [],
  };

  for (const location in modelFilters) {
    if (Array.isArray(modelFilters[location])) {
      const filtersArray: any = modelFilters[location];

      for (const filter of filtersArray) {
        generateFields({
          arg: filter,
          location,
          mongoFilter,
          fieldRules,
          operator,
        });
      }
    } else {
      generateFields({
        arg: modelFilters[location],
        location,
        mongoFilter,
        operator,
        fieldRules,
      });
    }
  }

  if (!Object.keys(modelFilters).length && fieldRules?.length) {
    for (const fieldRule of fieldRules) {
      generateFields({
        arg: {},
        location: fieldRule.location.toString(),
        mongoFilter,
        fieldRules,
        operator,
      });
    }
  }

  if (mongoFilter[operator].length) {
    return mongoFilter;
  } else {
    return {};
  }
};
