import { FindWithPaginationParams, HistoryFilterIntervalEnum } from "src/types";

function toCamelCase(string: string) {
  const STR = string
    .toLowerCase()
    .trim()
    .split(/[ -_]/g)
    .map((word) => word.replace(word[0], word[0].toString().toUpperCase()))
    .join("");
  return STR.replace(STR[0], STR[0].toLowerCase());
}

export async function createHistory<ModelType>(
  params: FindWithPaginationParams<ModelType>
) {
  const _id: Partial<
    Record<HistoryFilterIntervalEnum, Record<string, string>>
  > = {};

  if (params.mfgOptions?.history?.filter.interval.length) {
    for (const i of params.mfgOptions.history.filter.interval) {
      _id[i as HistoryFilterIntervalEnum] = {
        [`$${toCamelCase(i)}`]: "$createdAt",
      };
    }
  }

  const documents = await params.model.aggregate([
    { $match: params.filter },
    {
      $group: {
        _id,
        total: { $count: {} },
      },
    },
  ]);

  return documents;
}
