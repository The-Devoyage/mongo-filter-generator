import { Model } from 'mongoose';

interface FindWithPaginationParams<ModelType> {
  model: Model<ModelType>;
  filters: Record<any, any>;
  options: Record<any, any>;
}

export async function FindWithPagination<ModelType>(
  params: FindWithPaginationParams<ModelType>
) {
  const documents = await params.model.aggregate([
    { $match: params.filters },
    { $sort: params.options.sort },
    {
      $facet: {
        [params.model.modelName]: [{ $limit: params.options.limit }],
        modelInfo: [
          {
            $count: 'count',
          },
          {
            $addFields: {
              totalPages: {
                $ceil: [
                  {
                    $divide: ['$count', params.options.limit],
                  },
                ],
              },
            },
          },
        ],
      },
    },
  ]);

  return documents[0];
}
