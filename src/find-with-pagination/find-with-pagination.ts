import { Schema, FilterQuery } from "mongoose";
import { FindWithPaginationParams, PaginatedResponse } from "../types";
import { createHistory } from "./create-history";
import { HistoryFilterInput } from "@the-devoyage/request-filter-language";
import { Level } from "pino";
import { startLogger } from "../logger";

export function findAndPaginatePlugin(schema: Schema) {
  schema.statics.findAndPaginate = async function (
    filter: FilterQuery<unknown>,
    options: Record<string, unknown>,
    mfgOptions?: { history: { filter: HistoryFilterInput } },
    settings?: { logLevel: Level }
  ) {
    const paginatedResponse = await FindAndPaginate(
      {
        filter,
        options,
        model: this,
        mfgOptions,
      },
      settings
    );
    return paginatedResponse;
  };
}

export async function FindAndPaginate<ModelType>(
  params: FindWithPaginationParams<ModelType>,
  settings?: { logLevel: Level }
) {
  const logger = startLogger({ level: settings?.logLevel });
  const totalCountFilters = { ...params.filter };

  if ("createdAt" in totalCountFilters) {
    delete totalCountFilters.createdAt;
  }

  const totalCount = await params.model.countDocuments(
    totalCountFilters as FilterQuery<typeof params.model>
  );
  logger.debug({ totalCount });

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
    logger.info("Creating stats.");
    const data = documents[0][params.model.modelName];
    const prev_cursor = data[0]?.createdAt;
    const cursor = data[data.length - 1]?.createdAt;
    documents[0].stats[0].cursor = cursor;
    documents[0].stats[0].prev_cursor = prev_cursor;
    documents[0].stats[0].per_page = params.options.limit;
    logger.debug({ stats: documents[0].stats[0] });
  }

  const formatted: PaginatedResponse<ModelType> = {
    stats: documents[0].stats[0] ? documents[0].stats[0] : [],
    data: documents[0][params.model.modelName] ?? [],
  };

  if (params.mfgOptions?.history?.filter) {
    logger.info("Creating history stats.");
    const history = await createHistory(params);
    logger.debug({ history });
    formatted.stats.history = history;
  }

  return formatted;
}
