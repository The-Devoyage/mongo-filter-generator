import { Schema, FilterQuery } from "mongoose";
import {
  FindWithPaginationParams,
  HistoryFilterInput,
  PaginatedResponse,
} from "../types";
import { createHistory } from "./create-history";

export function findAndPaginatePlugin(schema: Schema) {
  schema.statics.findAndPaginate = async function (
    filter: FilterQuery<unknown>,
    options: Record<string, unknown>,
    mfgOptions?: { history: { filter: HistoryFilterInput } }
  ) {
    const paginatedResponse = await FindAndPaginate({
      filter,
      options,
      model: this,
      mfgOptions,
    });
    return paginatedResponse;
  };
}

export async function FindAndPaginate<ModelType>(
  params: FindWithPaginationParams<ModelType>
) {
  const totalCountFilters = { ...params.filter };

  if ("createdAt" in totalCountFilters) {
    delete totalCountFilters.createdAt;
  }

  const totalCount = await params.model.countDocuments(
    totalCountFilters as FilterQuery<typeof params.model>
  );

  const documents = await params.model.aggregate([
    { $match: params.filter },
    { $sort: params.options.sort },
    {
      $facet: {
        [params.model.modelName]: [{ $limit: params.options.limit ?? 4 }],
        stats: [
          {
            $count: "count",
          },
          {
            $addFields: {
              total: totalCount,
              remaining: {
                $cond: {
                  if: {
                    $gt: [{ $subtract: ["$count", params.options.limit] }, 0],
                  },
                  then: { $subtract: ["$count", params.options.limit] },
                  else: 0,
                },
              },
              page: {
                $ceil: {
                  $divide: [
                    {
                      $subtract: [
                        totalCount,
                        {
                          $cond: {
                            if: {
                              $gt: [
                                { $subtract: ["$count", params.options.limit] },
                                0,
                              ],
                            },
                            then: {
                              $subtract: ["$count", params.options.limit],
                            },
                            else: 0,
                          },
                        },
                      ],
                    },
                    params.options.limit,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  if (documents[0].stats[0] && documents[0][params.model.modelName]) {
    const data = documents[0][params.model.modelName];
    const cursor = data[data.length - 1]?.createdAt;
    documents[0].stats[0].cursor = cursor;
  }

  const formatted: PaginatedResponse<ModelType> = {
    stats: documents[0].stats[0] ? documents[0].stats[0] : [],
    data: documents[0][params.model.modelName] ?? [],
  };

  if (params.mfgOptions?.history?.filter) {
    const history = await createHistory(params);
    formatted.stats.history = history;
  }

  return formatted;
}
