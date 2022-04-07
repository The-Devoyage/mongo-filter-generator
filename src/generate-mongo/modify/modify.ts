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

export const transformGroups = (
  filter: FilterQuery<unknown>
): FilterQuery<unknown> => {
  for (const rootOperator in filter) {
    if (filter[rootOperator] && filter[rootOperator].length) {
      for (const group of filter[rootOperator]) {
        if (group.group) {
          for (const groupOperator in group) {
            if (groupOperator === "$and" || groupOperator === "$or") {
              if (group[groupOperator].length >= 2) {
                const transformedGroupOperatorArray: FilterQuery<unknown>[] =
                  [];

                for (const filterQuery of group[groupOperator]) {
                  const location = Object.keys(filterQuery)[0];
                  const splitLocation = location.split(".");
                  const rootKey = splitLocation[splitLocation.length - 1];

                  if (splitLocation.length === 1) {
                    transformedGroupOperatorArray.push(filterQuery);
                  } else {
                    const incomingFilterQuery = splitLocation
                      .reverse()
                      .reduce((res, key, idx) => {
                        if (idx !== 0) {
                          return { [key]: { $elemMatch: { $and: [res] } } };
                        } else {
                          return { [key]: res };
                        }
                      }, filterQuery[location]);

                    const index = transformedGroupOperatorArray.findIndex(
                      (fil: any) => {
                        const firstKey = Object.keys(fil)[0];
                        return firstKey === rootKey;
                      }
                    );

                    if (index > -1) {
                      for (let filter of transformedGroupOperatorArray) {
                        if (Object.keys(filter)[0] === rootKey) {
                          const existingFilterQuery =
                            transformedGroupOperatorArray[index];

                          const isObject = (item: any) => {
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
                                    const combinedFilters: Record<
                                      string,
                                      any
                                    >[] = [];

                                    if (existing[root]["$elemMatch"]["$and"]) {
                                      for (const filter of existing[root][
                                        "$elemMatch"
                                      ]["$and"]) {
                                        combinedFilters.push(filter);
                                      }
                                    }

                                    for (const fq of incoming[root][
                                      "$elemMatch"
                                    ]["$and"]) {
                                      if (
                                        !fq[Object.keys(fq)[0]]["$elemMatch"]
                                      ) {
                                        combinedFilters.push(fq);
                                      } else {
                                        if (combinedFilters.length) {
                                          let existingKey = false;

                                          for (
                                            let i = 0;
                                            i < combinedFilters.length;
                                            i++
                                          ) {
                                            const firstCombinedFilterKey =
                                              Object.keys(
                                                combinedFilters[i]
                                              )[0];

                                            if (
                                              firstCombinedFilterKey ===
                                              Object.keys(fq)[0]
                                            ) {
                                              existingKey = true;
                                              mergeDeep(combinedFilters[i], fq);
                                            }
                                          }
                                          if (!existingKey) {
                                            combinedFilters.push(fq);
                                          }
                                        } else {
                                          combinedFilters.push(fq);
                                        }
                                      }
                                    }

                                    existing[root] = {
                                      $elemMatch: {
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
                            existingFilterQuery,
                            incomingFilterQuery
                          );

                          transformedGroupOperatorArray[index] = combined;
                        }
                      }
                    } else {
                      transformedGroupOperatorArray.push(incomingFilterQuery);
                    }
                  }
                }
                const groupIndex = filter[rootOperator].findIndex(
                  (g: FilterQuery<unknown>) => g.group === group.group
                );

                filter[rootOperator][groupIndex] = {
                  ...filter[rootOperator][groupIndex],
                  [groupOperator]: transformedGroupOperatorArray,
                };
              } else {
                throw new Error(
                  "MFG Error: Invalid group length. Groups must contain more than query."
                );
              }
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
