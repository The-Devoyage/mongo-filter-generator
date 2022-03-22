# Mongo Filter Generator

Find, filter, paginate with a few lines of code - The Mongo Filter Generator Package allows the client to request filtered and paginated documents from a REST or GraphQL API that uses Mongoose to query a MongoDB instance.

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

Using mfg? Feel free to [Show Some Love\\\\$\$](https://basetools.io/checkout/vyOL9ATx)

## Highlights

### Find and Paginate Method

Add the find and paginate to any mongoose model to enabled filtered and paginated responses. Follow the setup guide below to add this method to the model.

```ts
const paginatedResponse = await User.findAndPaginate<IUser>(filter, options);

// Returns an object with the type PaginatedResponse
export interface PaginatedResponse<ModelType> {
  stats?: Stats;
  data?: ModelType[];
}
```

### Generate Mongo

Convert API requests to mongo filters and options. The GMF package will parse nested field or array filters from the request body or graphql args -- simply pass the whole object through.

```ts
const { filter, options } = GenerateMongo({
  fieldFilters: req.body,
  config: req.body.config,
});

const paginatedResponse = await User.find(filter, options);
```

### Standardized and Typed

The Mongo Filter Generator Package provides `fieldFilter` types that you can use to standardize incoming requests. Both Typescript and GraphQL types are included.

For example, the `GetDogsInput` is typed with filters provided by the package, allowing the client to have a standardized query input throughout the entire API.

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

First, add the MFG `typeDefs` and `resolvers` to your schmea. Adding types allows you to use `FieldFilters`, `ArrayFilters`, `FilterConfig`, and `Stats` within a custom schema. It also provides the `ObjectID` and `DateTime` scalars to all of your current typeDefs.

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

`FieldFilters` and `ArrayFilters` allow each property of a document to be searchable by requested criteria. The Field Filter Types grant options to the client by shaping the expected request. Check the documentation for all provided filters and types that can be used to shape requests.

Since you added the `GraphQL` types and resolvers to your schema, you do not need to re-declare them in the SDL.

GraphQL Example

You do not need to change anything other than the inputs, as such:

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
    nested_details: NestedDetailsInput
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
    const { filter, options } = GenerateMongo({
      fieldFilters: args.getAllUsersInput,
    });

    const accounts = await Account.find(filter, options);

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

  const { filter, options } = GenerateMongo({
    fieldFilters: request,
    config: request.config,
  });

  // Use filters to find the requested documents
  const dogs = await Dog.find(filter);

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
    const { filter, options } = GenerateMongo({
      fieldFilters: args.getAllUsersInput,
    });

    const paginatedAccounts = await FindAndPaginate({
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
    const { filter, options } = GenerateMongo({
      fieldFilters: args.getAllUsersInput,
    });

    const paginatedAccounts = await Account.findAndPaginate(filter, options);

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

## Reference

### Field Filters

IntFieldFilter

```ts
type IntFieldFilter = {
  filterBy: 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';
  int: number;
  operator?: 'AND' | 'OR';
};
```

StringFieldFilter

```ts
type StringFieldFilter = {
  filterBy: 'MATCH' | 'REGEX' | 'OBJECTID';
  string: string;
  operator?: 'AND' | 'OR';
};
```

BooleanFieldFilter

```ts
type BooleanFieldFilter = {
  filterBy: 'EQ' | 'NE';
  bool: Boolean;
  operator?: 'AND' | 'OR';
};
```

DateFieldFilter

```ts
type DateFieldFilter = {
  date: Date;
  filterBy: 'EQ' | 'NE' | 'LT' | 'GT' | 'LTE' | 'GTE';
  operator?: 'AND' | 'OR';
};
```

### Array Filters

```ts
type StringArrayFieldFilter = {
  filterBy: 'MATCH' | 'REGEX' | 'OBJECTID';
  string: string[];
  arrayOptions: 'IN' | 'NIN';
  operator?: 'AND' | 'OR';
};
```

### Filter Config

Send with request to API, and apply to the config option within the `GenerateMongo` method.

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
