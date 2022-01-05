import { PaginatedResponse, FindWithPaginationParams } from '../types';

export async function FindWithPagination<ModelType>(
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

  console.log(documents[0].stats[0]);

  const formatted: PaginatedResponse<ModelType> = {
    stats: documents[0].stats[0] ? documents[0].stats[0] : [],
    data: documents[0][params.model.modelName],
  };

  return formatted;
}
