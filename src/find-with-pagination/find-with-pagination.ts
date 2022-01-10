import { PaginatedResponse, FindWithPaginationParams } from '../types';
import { Schema, FilterQuery } from 'mongoose';

export function findAndPaginatePlugin(schema: Schema) {
  schema.statics.findAndPaginate = async function(
    filters: FilterQuery<any>,
    options: Record<any, any>
  ) {
    const paginatedResponse = await FindAndPaginate({
      filters,
      options,
      model: this,
    });
    return paginatedResponse;
  };
}

export async function FindAndPaginate<ModelType>(
  params: FindWithPaginationParams<ModelType>
) {
  const totalCountFilters = { ...params.filters };

  if ('createdAt' in totalCountFilters) {
    delete totalCountFilters.createdAt;
  }

  const totalCount = await params.model.countDocuments(
    totalCountFilters as typeof params.model
  );

  const documents = await params.model.aggregate([
    { $match: params.filters },
    { $sort: params.options.sort },
    {
      $facet: {
        [params.model.modelName]: [{ $limit: params.options.limit }],
        stats: [
          {
            $count: 'count',
          },
          {
            $addFields: {
              total: totalCount,
              remaining: {
                $cond: {
                  if: {
                    $gt: [{ $subtract: ['$count', params.options.limit] }, 0],
                  },
                  then: { $subtract: ['$count', params.options.limit] },
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
                                { $subtract: ['$count', params.options.limit] },
                                0,
                              ],
                            },
                            then: {
                              $subtract: ['$count', params.options.limit],
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

  const formatted: PaginatedResponse<ModelType> = {
    stats: documents[0].stats[0] ? documents[0].stats[0] : [],
    data: documents[0][params.model.modelName],
  };

  return formatted;
}
