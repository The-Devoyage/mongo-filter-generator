import { AddFilterArguments } from '../../types';
import { FilterQuery } from 'mongoose';

const addFilter = (params: AddFilterArguments): FilterQuery<unknown> => {
  const {
    filter,
    location,
    newFilter,
    operator,
    arrayOptions,
    groups,
  } = params;
  const parsedOperator = `$${operator ? operator.toLowerCase() : 'or'}`;

  if (!arrayOptions) {
    if (groups) {
      for (const group of groups) {
        const operatorType = group.includes('.or')
          ? '$or'
          : group.includes('.and')
          ? '$and'
          : null;

        if (!operatorType) {
          throw Error(
            'Group names must contain `.and` or `.or` in order to categorize the filter type and function.'
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            existing => existing.group === group
          );

          if (updating) {
            updating[parsedOperator] = [
              ...(updating[parsedOperator] ?? []),
              { [location]: newFilter },
            ];
          } else {
            filter[operatorType] = [
              ...(filter[operatorType] ?? []),
              {
                [parsedOperator]: [{ [location]: newFilter }],
                group,
              },
            ];
          }
        } else {
          filter[operatorType] = [
            {
              [parsedOperator]: [{ [location]: newFilter }],
              group,
            },
          ];
        }
      }
    } else if (parsedOperator in filter) {
      filter[parsedOperator] = [
        ...filter[parsedOperator],
        { [location]: newFilter },
      ];
    } else {
      filter[parsedOperator] = [{ [location]: newFilter }];
    }
  } else {
    if (groups) {
      for (const group of groups) {
        const operatorType = group.includes('.or')
          ? '$or'
          : group.includes('.and')
          ? '$and'
          : null;

        if (!operatorType) {
          throw Error(
            'Group names must contain `.and` or `.or` in order to categorize the filter type and function.'
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            existing => existing.group === group
          );

          if (updating) {
            updating[parsedOperator] = [
              ...(updating[parsedOperator] ?? []),
              {
                [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter },
              },
            ];
          } else {
            filter[operatorType] = [
              ...(filter[operatorType] ?? []),
              {
                [parsedOperator]: [
                  {
                    [location]: {
                      [`$${arrayOptions.toLowerCase()}`]: newFilter,
                    },
                  },
                ],
                group,
              },
            ];
          }
        } else {
          filter[operatorType] = [
            {
              [parsedOperator]: [
                {
                  [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter },
                },
              ],
              group,
            },
          ];
        }
      }
    } else if (parsedOperator in filter) {
      filter[parsedOperator] = [
        ...filter[parsedOperator],
        {
          [location]: {
            [`$${arrayOptions.toLowerCase()}`]: newFilter,
          },
        },
      ];
    } else {
      filter[parsedOperator] = [
        { [location]: { [`$${arrayOptions.toLowerCase()}`]: newFilter } },
      ];
    }
  }

  return filter;
};

export const Filter = {
  addFilter,
};
