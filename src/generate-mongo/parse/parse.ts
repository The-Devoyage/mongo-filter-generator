import { Validate } from "../validate";
import { FieldFilter } from "../../types";

export const parseFieldFilters = (
  object: unknown,
  rootLocation: string
): {
  fieldFilter: FieldFilter;
  location: string;
}[] => {
  let fieldFilters: { fieldFilter: FieldFilter; location: string }[] = [];

  if (Validate.isValidFieldFilter(object)) {
    fieldFilters.push({ fieldFilter: object, location: rootLocation });
    return fieldFilters;
  }

  if (Array.isArray(object)) {
    for (const ff in object) {
      const parsedArrayFilters = parseFieldFilters(object[ff], rootLocation);
      fieldFilters = [...fieldFilters, ...parsedArrayFilters];
    }
    return fieldFilters;
  }

  if (typeof object === "object" && object !== null && !Array.isArray(object)) {
    for (const property in object) {
      const objectProperty = (object as any)[property];

      if (
        typeof objectProperty === "object" &&
        objectProperty !== null &&
        Array.isArray(objectProperty)
      ) {
        for (const i of objectProperty) {
          const parsedArrayFilters = parseFieldFilters(
            i,
            [rootLocation, property].join(".")
          );

          fieldFilters = [...fieldFilters, ...parsedArrayFilters];
          continue;
        }
      } else if (
        typeof objectProperty === "object" &&
        objectProperty !== null &&
        !Array.isArray(objectProperty)
      ) {
        const parsed = parseFieldFilter(objectProperty, [
          rootLocation,
          property,
        ]);

        if (parsed && !!parsed.fieldFilter) {
          fieldFilters.push(
            parsed as { fieldFilter: FieldFilter; location: string }
          );
        } else if (!parsed && typeof object === "object") {
          const nestedParsed = parseFieldFilters(
            object,
            [rootLocation, property].join(".")
          );
          for (const nestedFilter of nestedParsed) {
            fieldFilters.push(nestedFilter);
          }
        }
      }
    }
  }

  return fieldFilters;
};

export const parseFieldFilter = (
  object: unknown,
  location: string[]
):
  | {
      fieldFilter: FieldFilter | undefined;
      location: string;
    }
  | undefined => {
  const deepFilterSearch = (object: unknown): FieldFilter | undefined => {
    // If Valid Field Filter, Return, no need to update location.
    if (Validate.isValidFieldFilter(object)) {
      return object;
    }

    // If not FieldFilter, keep looking deeper, and update location.
    for (const k in object as Record<string, unknown>) {
      location.push(k);
      const obj = (object as Record<string, unknown>)[k];
      if (typeof obj === "object") {
        return deepFilterSearch(obj as Record<string, unknown>);
      }
    }
    return;
  };

  let fieldFilter: FieldFilter | undefined;

  if (typeof object === "object") {
    fieldFilter = deepFilterSearch(object);
  }

  return { fieldFilter, location: location.join(".") };
};
