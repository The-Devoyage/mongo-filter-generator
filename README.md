# Mongo Filter Generator

Easily add Find, filter, paginating functionality to your API with just a few lines of code.

The Mongo Filter Generator Library allows the client to request filtered and paginated documents from a REST or GraphQL API that uses Mongoose to query a MongoDB instance.

## Main Features

### Generate Mongo Filters

Convert incoming request directly into mongoose filters.

```ts
const { filter, options } = GenerateMongo({
  fieldFilters: req.body,
  config: req.body.config,
});

const resutls = await User.find(filter, options);
```

### Find and Paginate Method

Instantly add the find and paginate method to any Mongoose model.

```ts
const paginatedResponse = await User.findAndPaginate<IUser>(filter, options);
```

Returns:

```
{
  data: [
    {
      _id: 1,
      name: "Bongo",
      age: 9,
    },
    {
      _id: 2,
      name: "Oakley",
      age: 4,
    },
  ],
  stats: {
    remaining: 10,
    total: 12,
    page: 1,
    cursor: "2022-09-03T00:45:17.245Z",
  };
}
```

### Easy Queries

Standardize the way that the client requests data from the API.

The following query returns accounts that:
- Have email field that contains the string "nick" 
**AND** 
- Has a role of either equal to 5 or less than 2.

**GraphQL Example**

```js
const { data } = useQuery(GET_ACCOUNTS, {
  variables: {
    email: { string: "nick", filterBy: "REGEX", operator: "AND" },
    role: [
      { filterBy: "EQ", int: 5, operator: "OR" },
      { filterBy: "LT", int: 2, operator: "OR" },
    ],
  },
});
```

**REST Example**

```ts
const response = await fetch("/api/accounts", {
  method: "GET",
  body: JSON.stringify({
    email: { filterBy: "REGEX", string: "nick", operator: "AND" },
    role: [
      { filterBy: "EQ", int: 5, operator: "OR" },
      { filterBy: "LT", int: 2, operator: "OR" },
    ],
  }),
});
```

## Install

1. Login to the github registry with your github account.

```
npm login --registry=https://npm.pkg.github.com
```

2. In the root of the target project, add the following to the `.npmrc` file to tell this package where to be downloaded from.

```
@the-devoyage:registry=https://npm.pkg.github.com
```

3. Install

```
npm install @the-devoyage/mongo-filter-generator
```

## Setup

### 1. Import Types, Resolvers, and Scalars

GraphQL:

First, add the MFG `typeDefs` and `resolvers` to the schema.

```ts
import { GraphQL } from "@the-devoyage/mongo-filter-generator";

const schema = buildFederatedSchema([
  { typeDefs: GraphQL.typeDefs, resolvers: GraphQL.resolvers },
  // ...other typeDefs and Resolvers
]);
```

ExpressJS:

If you are using express, you can optionally create types for each request body. The types are provided with the package and do not need to be imported or installed separately.

### 2. Use the Typings

The Field Filter Types shape the expected request which will enter the server.

GraphQL Example

Add Field Filters as Input Property Types

```ts
import { gql } from "apollo-server-core";

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
    users: StringFieldFilter
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

  type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

Express Example

With express you do not need to tell the server about every single detail. You can simply define a type for incoming request.body and use it within your routes.

```ts
import {
  StringFieldFilter,
  StringFieldFilter,
  IntFieldFilter,
  FilterConfig,
} from "@the-devoyage/mongo-filter-generator";

interface RequestBody {
  _id?: StringFieldFilter;
  name?: StringFieldFilter;
  breed?: StringFieldFilter;
  age?: IntFieldFilter;
  favoriteFoods?: StringFieldFilter;
  createdAt?: StringFieldFilter;
  config?: FilterConfig;
}
```

### 3. Generate Mongo

Use the `GenerateMongo` function to convert the typed request to a Mongo filter.

The `fieldFilters` argument must be the same shape as the requested document.

Graphql Example:

```ts
// Resolvers.ts
import { GenerateMongo } from "@the-devoyage/mongo-filter-generator";
import { Account } from "models";

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
app.get("/", (req, res) => {
  const request: GetDogsRequestBody = req.body;

  const { filter, options } = GenerateMongo({
    fieldFilters: request,
    config: request.config,
  });

  const dogs = await Dog.find(filter);

  res.json(dogs);
});
```

### 4. Find and Paginate

Use the generated `filter` and `options` properties, from the `GenerateMongo` method, with the provided find and paginate function.

```ts
import { GenerateMongo, FindAndPaginate } from "@the-devoyage/mongo-filter-generator";
import { Account } from "models";

const Query = {
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

**or**

**Note - You must Enable the `findAndPaginate()` method with Mongoose Plugins for the following to execute. Instructions below.**

```ts
import { GenerateMongo } from "@the-devoyage/mongo-filter-generator";
import { Account } from "models";

export const Query = {
  getAccounts: async (_, args) => {
    const { filter, options } = GenerateMongo({
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

#### 4.1. Install `findAndPaginate`

To apply the `findAndPaginate()` method to models, as the above example demonstrates, you must provide the provided mongoose plugin. 

```ts
// entry-point.ts -- The entry point to the entire server.
import mongoose from "mongoose";
import { findAndPaginatePlugin } from "@the-devoyage/mongo-filter-generator";
mongoose.plugin(findAndPaginatePlugin);
import { typeDefs, resolvers } from "./schema";
```

Lastly, if you are using typescript, be sure to provide the `FindAndPaginateModel` definition to the model. This informs Typescript that the method is available.

```ts
// UserModel.ts
import { FindAndPaginateModel } from "@the-devoyage/mongo-filter-generator";
import mongoose from "mongoose";
import { User as IUser } from "types/generated";

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
  "User",
  UserSchema
);
```

## Advanced Features

### 1. Groups

Groups allow a more selective `and/or` filtering between selections of multiple properties within the document. 

For example, you might want to find a user that has `age of less than 30 and name that is "luna"` or `age of greater than 20 and name is "johnny"`.

#### Example

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

This query will find users who have a `favorite food of pizza or wings` AND `has a name that contains jim or john`.

Group names must end with `.and` or `.or` to determine the function of the nested group.

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

### 2. Field Rules

Field Rules can be applied to `GenerateMongo` arguments in order to perform a variety of actions when creating filters, and enforcing finding patterns.

Properties:
- "location" - A string containing the location of the rule. For example, `user.name.first`
- "fieldFilter" - A "Field Filter" that matches the type within the database.
- "action" - The performed rule, see below.

Actions:

- "INITIAL" - Provide a default field filter for every operation. Client request may overwrite the filter with their own request.
- "DISABLE" - Revoke client permission to query certain fields.
- "COMBINE" - Combine the field filter provided within the field rule with the field filter provided by the client.
- "OVERRIDE" - A default value that can not be overridden. An error is thrown if a client tries to request filtering with this field.

```ts
const { filter, options } =
  GenerateMongo <
  IUser >({
    fieldFilters: args.getAllUsersInput,
    config: args.getAllUsersInput.config,
    fieldRules: [
      {
        location: "name",
        fieldFilter: {
          string: "Edmo",
          filterBy: "REGEX",
          operator: "OR",
          groups: ["names.and"],
        },
        action: "COMBINE",
      },
    ],
  });
```

### 3. Stats

Stats allow you to see simple data about the query. All results from the provided `FindAndPaginate` methods return `Stats`.

```ts
type Stats = {
  remaining: Number;
  total: Number;
  page: Number;
  cursor: Date;
  history: HistoricalStats[];
};
```

GraphQL

1. Add Stats to your Schema Response

```ts
import { gql } from "apollo-server-core";

export const typeDefs = gql`
  type Dog {
    _id: ObjectID!
    createdAt: DateTime! 
    name: String!
  }

  input GetAccountsInput {
    _id: StringFieldFilter
    ...
  }

  type GetAccountsResponse {
    stats: Stats
    data: [Dog]
  }

  type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

Express

No action needed!

2. The Find and Paginate methods return `Stats`

```ts
const { data, stats } = await FindAndPaginate<IAccount>({
  filter,
  options,
  model: Account,
});
```

### 4. Historical Stats

Historical Stats are helpful when aggregating data about a query for use within charts, graphs, and pagination. 

Pass a third option to the `FindAndPaginate` method to enable Historical Stats. The property `stats.history` is then returned.

Historical Stats allow you to get information about the query, grouped in chosen intervals. 

The following example request historical stats grouped by `DAY_OF_MONTH` and `MONTH`. 

The `stats.history` array shows how many users were created on each day of each month. 

You can see below that 8 users were created on May 16th, 1 user was created on April 16th, and 1 user was created on May 18th.

```ts
// Call The Function
const users = await User.findAndPaginate<IUser>(filter, options, {
  history: {
    filter: {
      interval: ["DAY_OF_MONTH", "MONTH"],
    },
  },
});

// Response
{
  stats: {
    total: 10,
    cursor: "2022-05-16T22:20:51.208Z",
    page: 1,
    remaining: 6,
    history: [
      {
        _id: {
          DAY_OF_MONTH: 16,
          MONTH: 5
        },
        "total": 8
      },
      {
        _id: {
          DAY_OF_MONTH: 16,
          MONTH: 4
        },
        total: 1
      },
      {
        _id: {
          DAY_OF_MONTH: 18,
          MONTH: 5
        },
        total: 1
      }
    ]
  },
}
```

## Reference

### Field Filters

Used to type the properties of an incoming request.

```ts
type IntFieldFilter = {
  filterBy: "EQ" | "GT" | "GTE" | "LT" | "LTE" | "NE";
  int: number;
  operator?: "AND" | "OR";
  groups: string[];
};
```

```ts
type StringFieldFilter = {
  filterBy: "MATCH" | "REGEX" | "OBJECTID";
  string: string;
  operator?: "AND" | "OR";
  groups: string[];
};
```

```ts
type BooleanFieldFilter = {
  filterBy: "EQ" | "NE";
  bool: Boolean;
  operator?: "AND" | "OR";
  groups: string[];
};
```

```ts
type DateFieldFilter = {
  date: Date;
  filterBy: "EQ" | "NE" | "LT" | "GT" | "LTE" | "GTE";
  operator?: "AND" | "OR";
  groups: string[];
};
```

```ts
type StringArrayFieldFilter = {
  filterBy: "MATCH" | "REGEX" | "OBJECTID";
  string: string[];
  arrayOptions: "IN" | "NIN";
  operator?: "AND" | "OR";
  groups: string[];
};
```

### Filter Config

Used to type a configuration property of a request, to allow the client to control pagination. Can then be passed to the `GenerateMongo` method to convert it to Mongoose `QueryOptions`.

```ts
type FilterConfig = {
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
type Stats = {
  remaining: Number;
  total: Number;
  page: Number;
  cursor: Date;
  history: HistoricalStats[];
};
```

### Historical Stats

```
type HistoricStats = {
  total: number;
  _id: Record<HistoryFilterIntervalEnum, number>;
};

type HistoryFilterIntervalEnum =
  | "YEAR"
  | "DAY_OF_YEAR"
  | "MONTH"
  | "DAY_OF_MONTH"
  | "WEEK"
  | "DAY_OF_WEEK"
  | "HOUR"
  | "MINUTES"
  | "SECONDS"
  | "MILLISECONDS";
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
import { GraphQL } from "@the-devoyage/mongo-filter-generator";

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

- `Modify.Filter.addFilter` - Add a mongo query filter to an existing query filter object based on location, operator, groups, and array options.
- `Modify.FieldFilter.applyFieldRule` - Applies field rule to field filter and returns updated field filter if rule applies. Updated field rules array is returned based on the rule type as well.

### Generate

- `Generate.filterQuery` - Converts any field filter to a Mongo Query Filter. Applies additional rules if applicable.
