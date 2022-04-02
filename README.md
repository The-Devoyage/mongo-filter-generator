# Mongo Filter Generator

Find, filter, paginate with a few lines of code - The Mongo Filter Generator Library allows the client to request filtered and paginated documents from a REST or GraphQL API that uses Mongoose to query a MongoDB instance.

## Install

1. Login to the github registry with your github account.

```
npm login --registry=https://npm.pkg.github.com
```

2. In the root of the target project, add the following to the `.npmrc` file:

```
@the-devoyage:registry=https://npm.pkg.github.com
```

3. Install

```
npm i @the-devoyage/mongo-filter-generator
```

## Show Some Love

Using mfg or think it's a cool library? Feel free to [Show Some Love](https://basetools.io/checkout/vyOL9ATx)! Purchase grants instant github collaborator access for the life of the project.

## Main Features

### Find and Paginate Method

Add the find and paginate to any mongoose model to enable filtered and paginated responses. Simple setup guide is below to add this method to the model with Mongoose Plugins.

```ts
const paginatedResponse = await User.findAndPaginate<IUser>(filter, options);

// Returns an object with the type PaginatedResponse - Data is stored in the data property while information about pagination is stored in `stats`.
export interface PaginatedResponse<ModelType> {
  stats: Stats;
  data: ModelType[];
}
```

### Generate Mongo

Convert API request body or graphql args to mongo filters and options. The MFG library will parse nested field or array filters from the request body or graphql args -- simply pass the whole object through.

**_note_** - The `fieldFilters` object should be a `Partial` shape of the model/document of which you are querying.

```ts
const { filter, options } = GenerateMongo<IUser>({
  fieldFilters: req.body as Record<keyof IUser, unknown>,
  config: req.body.config,
});

const paginatedResponse = await User.find(filter, options);
```

### Standardized and Typed

The Mongo Filter Generator Package provides `fieldFilter` types that you can use to standardize incoming requests. Both Typescript and GraphQL types are included.

For example, the `GetDogsInput` is typed with filters provided by the library, allowing the client to have a standardized query input with extended querying capabilities throughout the entire API.

GraphQL Example

```ts
//typeDefs.ts
const typeDefs = gql`
  type Dog {
    _id: ObjectID!
    age: Int!
    breeds: [String!]!
  }

  input GetDogsInput {
    _id: StringFieldFilter
    age: [IntFieldFilter]
    breeds: StringArrayFieldFilter
  }

  type GetDogsResponse {
    stats: Stats!
    data: [Dog!]!
  }

  type Query {
    getDogs(getDogsInput: GetDogsInput): GetDogsResponse!
  }
`;
```

While with GraphQL it is required to provide the typings to the GraphQL Server, with Typescript, it is not. Typescript users can still define their own types for incoming requests!

```ts
// types.d.ts
import {
  StringFieldFilter,
  StringArrayFilter,
  IntFieldFilter,
  FilterConfig,
} from '@the-devoyage/mongo-filter-generator';

export interface GetDogsRequestBody {
  _id?: StringFieldFilter;
  name?: StringArrayFilter;
  breed?: StringFieldFilter;
  age?: IntFieldFilter;
  favoriteFoods?: StringArrayFilter;
  createdAt?: StringArrayFilter;
  config?: FilterConfig;
}
```

## Example Queries

The following query returns accounts that:

- Have email field that contains the string "nick" **AND** Have role of either equal to 5 or less than 2.

GraphQL Example

```js
const GET_ACCOUNTS = gql`
  query GetAccounts($getAccountsInput: GetAccountsInput!) {
    getAccounts(getAccountsInput: $getAccountsInput) {
      _id
      email
      role
      activation {
        verified
      }
    }
  }
`;

const { data } = useQuery(GET_ACCOUNTS, {
  variables: {
    getAccountsInput: {
      email: { filterBy: 'REGEX', string: 'nick', operator: 'AND' },
      role: [
        { filterBy: 'EQ', int: 5, operator: 'OR' },
        { filterBy: 'LT', int: 2, operator: 'OR' },
      ],
    },
  },
});
```

REST Example

```ts
const response = await fetch('/api/accounts', {
  method: 'GET',
  body: JSON.stringify({
    email: { filterBy: 'REGEX', string: 'nick', operator: 'AND' },
    role: [
      { filterBy: 'EQ', int: 5, operator: 'OR' },
      { filterBy: 'LT', int: 2, operator: 'OR' },
    ],
  }),
});
```

## Setup

### 1. Import Types and Resolvers

GraphQL:

First, add the MFG `typeDefs` and `resolvers` to the schema. Doing so allows you to use `FieldFilter`, `FilterConfig`, and `Stats` (along with other provided types, see reference for more) within a custom schema. It also provides the `ObjectID` and `DateTime` scalars to all of your current typeDefs.

```ts
import { GraphQL } from '@the-devoyage/mongo-filter-generator';

const schema = buildFederatedSchema([
  { typeDefs: GraphQL.typeDefs, resolvers: GraphQL.resolvers },
  // ...other typeDefs and Resolvers
]);
```

ExpressJS:

If you are using express, you can optionally create types for each request body. The types are provided with the package and do not need to be imported or installed separately.

### 2. Add Field or Array Filters To Your Custom Schema

`FieldFilters` and `ArrayFilters` allow each property of a document to be searchable by requested criteria. The Field Filter Types grant options to the client by shaping the expected request which will enter the server. Check the reference below for all provided filters, inputs, types, and scalars that can be used to shape requests.

Since you added the `GraphQL` types and resolvers [step 1 above] to your schema, you do not need to re-declare them in the SDL.

GraphQL Example

Add Field Filters as Input Property Types

```ts
import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  type Account {
    _id: ObjectID!
    createdAt: DateTime!
    email: String!
    role: Int!
    users: [User!]!
    nested_details: NestedDetails!
  }

  type User {
    _id: ObjectID!
  }

  type NestedDetails {
    age: Int!
    married: Boolean!
  }

  input GetAccountsInput {
    _id: StringFieldFilter
    users: StringArrayFieldFilter
    email: StringFieldFilter
    role: [IntFieldFilter] # Arrays Accepted
    nested_details: NestedDetailsInput # Nested Objects are Valid
  }

  input NestedDetailsInput {
    age: IntFieldFilter
    married: BooleanFieldFilter
  }

  type GetAccountsResponse {
    stats: Stats
    data: [Account]
  }

  extend type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

Express Example

With express you do not need to tell the server about every single detail. You can simply define a type for incoming request.body and use it within your routes.

```ts
import {
  StringFieldFilter,
  StringArrayFieldFilter,
  IntFieldFilter,
  FilterConfig,
} from '@the-devoyage/mongo-filter-generator';

export interface GetDogsRequestBody {
  _id?: StringFieldFilter;
  name?: StringArrayFieldFilter;
  breed?: StringFieldFilter;
  age?: IntFieldFilter;
  favoriteFoods?: StringArrayFieldFilter;
  createdAt?: StringArrayFieldFilter;
  config?: FilterConfig;
}
```

### 3. Generate Mongo

Use the `GenerateMongo` function to convert the typed request to a mongo filter.

You may use the generated filters with the standard `mongooseDocument.find()` method or with the provided `mongooseDocument.findAndPaginate()` method (setup required for `findAndPaginate()`).

Graphql Example:

```ts
// Resolvers.ts
import { GenerateMongo } from '@the-devoyage/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    const { filter, options } = GenerateMongo<IAccount>({
      fieldFilters: args.getAllUsersInput,
    });

    const accounts = await Account.find<IAccount>(filter, options);

    return accounts;
  },
};
```

Express JS Example

```ts
import {
  StringFieldFilter,
  StringArrayFieldFilter,
  IntFieldFilter,
  FilterConfig,
} from '@the-devoyage/mongo-filter-generator';

export interface GetDogsRequestBody {
  _id?: StringFieldFilter;
  name?: StringArrayFieldFilter;
  breed?: StringFieldFilter;
  age?: IntFieldFilter;
  favoriteFoods?: StringArrayFieldFilter;
  createdAt?: StringArrayFieldFilter;
  config?: FilterConfig;
}

app.get('/', (req, res) => {
  const request: GetDogsRequestBody = req.body;

  const { filter, options } = GenerateMongo<IDog>({
    fieldFilters: request,
    config: request.config,
  });

  // Use filters to find the requested documents
  const dogs = await Dog.find<IDog>(filter);

  res.json(dogs);
});
```

### 4. Find and Paginate

Use the generated `filter` and `options`, from the `GenerateMongo` method, with the provided find and paginate function.

```ts
import { GenerateMongo } from '@the-devoyage/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    const { filter, options } = GenerateMongo<IAccount>({
      fieldFilters: args.getAllUsersInput,
    });

    const paginatedAccounts = await FindAndPaginate<IAccount>({
      filter,
      options,
      model: Account,
    });

    return paginatedAccounts;
  },
};
```

or

**Note - You must Enable the `findAndPaginate()` method with Mongoose Plugins for the following to execute. Instructions below.**

```ts
import { GenerateMongo } from '@the-devoyage/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    const { filter, options } = GenerateMongo<IAccount>({
      fieldFilters: args.getAllUsersInput,
    });

    const paginatedAccounts = await Account.findAndPaginate<IAccount>(
      filter,
      options
    );

    return paginatedAccounts;
  },
};
```

To apply the `findAndPaginate()` method to models, as the above example, you must apply the provided mongoose plugin. This may be done within the server file for global plugin, or within the model definition file, for a one time use.

Note - If this is done within the server/entry point, the plugin must be defined BEFORE routes/resolvers and model imports. Read the Mongoose Global Plugins Documentation for more details.

```ts
// entry-point.ts
import mongoose from 'mongoose';
import { findAndPaginatePlugin } from '@the-devoyage/mongo-filter-generator';
mongoose.plugin(findAndPaginatePlugin);
import { typeDefs, resolvers } from './schema';
```

Lastly, if you are using typescript, be sure to provide the `FindAndPaginateModel` definition to the model. This informs Typescript that the method is available.

```ts
// UserModel.ts
import { FindAndPaginateModel } from '@the-devoyage/mongo-filter-generator';
import mongoose from 'mongoose';
import { User as IUser } from 'types/generated';

const Schema = mongoose.Schema;

const UserSchema = new Schema<IUser, FindAndPaginateModel>(
  {
    name: {
      type: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser, FindAndPaginateModel>(
  'User',
  UserSchema
);
```

### 5. Groups

Groups are included as a base part of all filters and allow you to query multiple properties within and/or groupings when constructing the request.
There is no additional setup to use grouped filters. All group names must end with `.and` or `.or` in order to specify the functionality of the group.

Let's query for users as an example.

```graphql
type User {
  name: String!
  age: Int!
  married: Boolean!
  _id: ID!
  createdAt: DateTime!
  favFoods: [String!]!
}
```

1. Construct a query with groups. This query will find users who have a favorite food of pizza or wings AND have a name that contains (regex) jim or john.

```json
{
  "getAllUsersInput": {
    "favFoods": [
      {
        "arrayOptions": "IN",
        "filterBy": "REGEX",
        "string": ["pizza"],
        "operator": "OR",
        "groups": ["favFoodsGroup.and"]
      },
      {
        "arrayOptions": "IN",
        "filterBy": "REGEX",
        "string": ["wings"],
        "operator": "OR",
        "groups": ["favFoodsGroup.and"]
      }
    ],
    "name": [
      {
        "filterBy": "REGEX",
        "operator": "OR",
        "string": "jim",
        "groups": ["namesGroup.or"]
      },
      {
        "filterBy": "REGEX",
        "operator": "OR",
        "string": "john",
        "groups": ["namesGroup.or"]
      }
    ]
  }
}
```

2. The Generate Mongo Function will return filters that group the properties together by group name and and/or condition. In case you want to see what it looks like:

```json
{
  "$or": [
    {
      "$or": [
        {
          "name": {}
        },
        {
          "name": {}
        }
      ]
    }
  ],
  "$and": [
    {
      "$or": [
        {
          "favFoods": {
            "$in": [{}]
          }
        },
        {
          "favFoods": {
            "$in": [{}]
          }
        }
      ]
    }
  ]
}
```

## Reference

### Field Filters

Used to type the properties of an incoming request.

```ts
type IntFieldFilter = {
  filterBy: 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';
  int: number;
  operator?: 'AND' | 'OR';
  groups: string[];
};
```

```ts
type StringFieldFilter = {
  filterBy: 'MATCH' | 'REGEX' | 'OBJECTID';
  string: string;
  operator?: 'AND' | 'OR';
  groups: string[];
};
```

```ts
type BooleanFieldFilter = {
  filterBy: 'EQ' | 'NE';
  bool: Boolean;
  operator?: 'AND' | 'OR';
  groups: string[];
};
```

```ts
type DateFieldFilter = {
  date: Date;
  filterBy: 'EQ' | 'NE' | 'LT' | 'GT' | 'LTE' | 'GTE';
  operator?: 'AND' | 'OR';
  groups: string[];
};
```

```ts
type StringArrayFieldFilter = {
  filterBy: 'MATCH' | 'REGEX' | 'OBJECTID';
  string: string[];
  arrayOptions: 'IN' | 'NIN';
  operator?: 'AND' | 'OR';
  groups: string[];
};
```

### Filter Config

Used to type a configuration property of a request, to allow the client to control pagination. Can then be passed to the `GenerateMongo` method to convert it to Mongoose `QueryOptions`.

```ts
export type FilterConfig = {
  pagination?: {
    limit?: number;
    reverse?: boolean;
    createdAt?: Date;
  };
};
```

### Stats

The `stats` object is returned from the `FindAndPaginate` function or the `model.findAndPaginate()` method. Send this back to the client as a response.

```ts
export type Stats = {
  remaining: Number;
  total: Number;
  page: Number;
  cursor: Date;
};
```

### GenerateMongo

Used to convert an object which contains field filters to mongo filters. Field filters may be in arrays or nested within the object.

```ts
const { filter, options } = GenerateMongo({ fieldFilters: req.body });
```

### FindAndPaginate

Pass the generated filters and options returned from `GenerateMongo` to the FindAndPaginate function or the `model.findAndPaginate` method to add pagination to the query.

Pass an object of type `FilterConfig` to `GenerateMongo` to produce the `options` object, enabling pagination options.

```ts
const PaginatedResponse = await Model.findAndPaginate<IModel>(filter, options);
```

### PaginatedResponse

The return of `FindAndPaginate` - response with paginated and sorted data.

```ts
export interface PaginatedResponse<ModelType> {
  stats: Stats;
  data: ModelType[];
}
```

### GraphQL

Resolvers and Type Defs that must be added to the graphql schema in order to use the available field filters, types, and scalars.

```ts
import { GraphQL } from '@the-devoyage/mongo-filter-generator';

const schema = buildFederatedSchema([
  { typeDefs: GraphQL.typeDefs, resolvers: GraphQL.resolvers },
]);
```

### Parse

A collection of helpers to parse data.

- `Parse.parseFieldFilter` - Find field filters within an object starting from a specified location.

### Validate

A collection of helpers to validate field filters and other MFG objects.

- `Validate.isFieldFilter`
- `Validate.isStringFieldFilter`
- `Validate.isBooleanFieldFilter`
- `Validate.isIntFieldFilter`
- `Validate.isDateFieldFilter`

### Modify

A collection of helpers to modify objects associated with MFG.

- `Modify.addFilter` - Add a mongo query filter to an existing query filter object based on location, operator, groups, and array options.

### Generate 

- `Generate.filterQuery` - Converts any field filter to a Mongo Query Filter. Applies additional rules if applicable.
