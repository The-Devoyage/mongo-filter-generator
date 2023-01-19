import {
  AddFilterArguments,
  FieldRule,
} from "../../types";
import { FilterQuery } from "mongoose";
import { FieldFilter as IFieldFilter } from "@the-devoyage/request-filter-language";

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

export const transformGroups = (
  filter: FilterQuery<unknown>
): FilterQuery<unknown> => {
  for (const rootAndOr in filter) {
    if (filter[rootAndOr] && filter[rootAndOr].length) {
      for (const group of filter[rootAndOr]) {
        if (group.group) {
          for (const groupAndOr in group) {
            if (groupAndOr === "$and" || groupAndOr === "$or") {
              const transformedGroupAndOr: FilterQuery<unknown>[] = [];

              for (const queryFilter of group[groupAndOr]) {
                const location = Object.keys(queryFilter)[0];
                const splitLocation = location.split(".");

                if (splitLocation.length === 1) {
                  transformedGroupAndOr.push(queryFilter);
                } else {
                  const newFilter = splitLocation
                    .reverse()
                    .reduce((res, key, idx) => {
                      if (idx !== 0) {
                        return { [key]: { $elemMatch: { $and: [res] } } };
                      } else {
                        return { [key]: res };
                      }
                    }, queryFilter[location]);

                  const index = transformedGroupAndOr.findIndex((fil: any) => {
                    const firstKey = Object.keys(fil)[0];
                    return firstKey === splitLocation[splitLocation.length - 1];
                  });

                  if (index > -1) {
                    for (const filter of transformedGroupAndOr) {
                      if (
                        Object.keys(filter)[0] ===
                        splitLocation[splitLocation.length - 1]
                      ) {
                        const existingFilter = transformedGroupAndOr[index];

                        const incomingFilter = newFilter;

                        const isObject = (item: unknown) => {
                          return (
                            item &&
                            typeof item === "object" &&
                            !Array.isArray(item)
                          );
                        };

                        const mergeDeep = (
                          existing: Record<string, any>,
                          incoming: Record<string, any>
                        ) => {
                          if (isObject(incoming)) {
                            for (const root in incoming) {
                              if (isObject(incoming[root])) {
                                if (incoming[root]["$elemMatch"]["$and"]) {
                                  const combinedFilters: Record<string, any>[] =
                                    [];

                                  if (existing[root]["$elemMatch"]["$and"]) {
                                    for (const filter of existing[root][
                                      "$elemMatch"
                                    ]["$and"]) {
                                      combinedFilters.push(filter);
                                    }
                                  }

                                  for (const filter of incoming[root][
                                    "$elemMatch"
                                  ]["$and"]) {
                                    if (
                                      !filter[Object.keys(filter)[0]][
                                      "$elemMatch"
                                      ]
                                    ) {
                                      combinedFilters.push(filter);
                                    } else {
                                      if (combinedFilters.length) {
                                        let existingKey = false;
                                        for (
                                          let i = 0;
                                          i < combinedFilters.length;
                                          i++
                                        ) {
                                          const key = Object.keys(
                                            combinedFilters[i]
                                          )[0];

                                          if (key === Object.keys(filter)[0]) {
                                            existingKey = true;
                                            mergeDeep(
                                              combinedFilters[i],
                                              filter
                                            );
                                          }
                                        }
                                        if (!existingKey) {
                                          combinedFilters.push(filter);
                                        }
                                      } else {
                                        combinedFilters.push(filter);
                                      }
                                    }
                                  }

                                  existing[root] = {
                                    $elemMatch: {
                                      //...existing[root]["$elemMatch"],
                                      $and: combinedFilters,
                                    },
                                  };
                                }
                              }
                            }
                          }
                          return existing;
                        };

                        const combined = mergeDeep(
                          existingFilter,
                          incomingFilter
                        );

                        transformedGroupAndOr[index] = combined;
                      }
                    }
                  } else {
                    transformedGroupAndOr.push(newFilter);
                  }
                }
              }
              const groupIndex = filter[rootAndOr].findIndex(
                (g: FilterQuery<unknown>) => g.group === group.group
              );

              filter[rootAndOr][groupIndex] = {
                ...filter[rootAndOr][groupIndex],
                [groupAndOr]: transformedGroupAndOr,
              };
            }
          }
        }
      }
    }
  }
  if (filter["$or"]) {
    for (const group of filter["$or"]) {
      if ("group" in group) {
        delete group.group;
      }
    }
  }
  if (filter["$and"]) {
    for (const group of filter["$and"]) {
      if ("group" in group) {
        delete group.group;
      }
    }
  }
  return filter;
};

export const FieldFilter = {
  applyFieldRule,
};

export const Filter = {
  addFilter,
  transformGroups,
};
