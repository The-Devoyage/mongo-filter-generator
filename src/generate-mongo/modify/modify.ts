import {
  AddFilterArguments,
  FieldFilter as IFieldFilter,
  FieldRule,
} from "../../types";
import { FilterQuery } from "mongoose";

const addFilter = (params: AddFilterArguments): FilterQuery<unknown> => {
  const { filter, location, newFilter, operator, arrayOptions, groups } =
    params;
  const parsedOperator = `$${operator ? operator.toLowerCase() : "or"}`;

  if (!arrayOptions) {
    if (groups) {
      for (const group of groups) {
        const operatorType = group.includes(".or")
          ? "$or"
          : group.includes(".and")
          ? "$and"
          : null;

        if (!operatorType) {
          throw Error(
            "Group names must contain `.and` or `.or` in order to categorize the filter type and function."
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            (existing) => existing.group === group
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
        const operatorType = group.includes(".or")
          ? "$or"
          : group.includes(".and")
          ? "$and"
          : null;

        if (!operatorType) {
          throw Error(
            "Group names must contain `.and` or `.or` in order to categorize the filter type and function."
          );
        }

        if (filter[operatorType]) {
          const updating = filter[operatorType]?.find(
            (existing) => existing.group === group
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

const applyFieldRule = (
  fieldRule: FieldRule,
  fieldFilter: IFieldFilter,
  fieldRules: FieldRule[]
): {
  fieldFilter: IFieldFilter;
  location: string;
  updatedFieldRules: FieldRule[];
} => {
  switch (fieldRule.action) {
    case "DISABLE":
      if (fieldFilter) {
        throw new Error(
          `MFG ERROR: Access to property "${fieldRule.location}" denied by server.`
        );
      }
      break;

    case "COMBINE":
      if (!fieldRule.fieldFilter?.groups?.length) {
        throw new Error(
          `MFG ERROR: Use of field rule action "COMBINE" requires at least one group to be present.`
        );
      }

      if (fieldFilter) {
        return {
          fieldFilter: {
            ...fieldFilter,
            groups: [
              ...(fieldFilter.groups ?? []),
              ...(fieldRule.fieldFilter?.groups ?? []),
            ],
          },
          location: fieldRule.location,
          updatedFieldRules: fieldRules,
        };
      }
      break;

    case "INITIAL":
      if (fieldFilter) {
        fieldRules = fieldRules.filter(
          (rule) => rule.location !== fieldRule.location
        );
        return {
          fieldFilter: fieldFilter,
          location: fieldRule.location,
          updatedFieldRules: fieldRules,
        };
      }
      break;

    case "OVERRIDE":

    default:
      if (fieldFilter) {
        throw new Error(
          `MFG ERROR: Access to property "${fieldRule.location}" denied. Override value has been defined by server.`
        );
      }

      if (!fieldRule.fieldFilter) {
        throw new Error(
          `MFG ERROR: Access to property "${fieldRule.location}" denied. Override value has not been specified by server.`
        );
      }

      fieldRules = fieldRules.filter(
        (rule) => rule.location !== fieldRule.location
      );
      return {
        fieldFilter: fieldRule.fieldFilter,
        location: fieldRule.location,
        updatedFieldRules: fieldRules,
      };
  }

  return {
    fieldFilter,
    updatedFieldRules: fieldRules,
    location: fieldRule.location,
  };
};

export const FieldFilter = {
  applyFieldRule,
};

export const Filter = {
  addFilter,
};
