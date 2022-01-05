# Mongo Filter Generator

## Features

This package automatically transforms requests from client applications into filters for mongo, allowing you to search for and paginate nested results across Apollo Federated graphql sub-schemas.

- Standardizes filters for requests made from client to api.
- Less logic in api filters and reducers.
- More control over each property of each document.
- Easy to install, setup, and implement with minimal code.

## Example Query

After adding the few lines of boilerplate code to your API, the client instantly will be able to request filtered and paginated documents from the server without hassle.

The following query/variable combination returns accounts that:

- Have email field that contains the string "nick" **AND** Have role of either equal to 5 or less than 2.

```ts
// Graphql Query
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
```

```json
// Query Variables
{
  "variables": {
    "getAccountsInput": {
      "email": { "filter": "REGEX", "string": "nick" },
      "role": [
        { "filter": "EQ", "int": 5 },
        { "filter": "LT", "int": 2 }
      ],
      "filterConfig": { "operator": "AND" }
    }
  }
}
```

## Install

`npm i @nickisyourfan/mongo-filter-generator`

## Setup

### 1. Import Types

You will need to add the `typeDefs` to your schmea. Apollo Federation example:

```ts
import { typeDefs as MFGTypeDefs } from '@nickisyourfan/mongo-filter-generator'; // Import types from the package.
import { typeDefs, resolvers } from './graphql';

const schema = buildFederatedSchema([
  { typeDefs, resolvers },
  { typeDefs: MFGTypeDefs }, // Add types to schema.
]);
```

### 2. Add Field Filters To Your Custom Schmea

Field Filters allow each property of a document to be searchable by requested criteria. The Field Filter Types grant options to the client by shaping the expected request.

Below, we define the input, `GetAccountsInput`. It contains a few Field Filters. Notice, the definition of the `getAccounts` function can send back a fuller response including `Stats` and the Accounts themselves. The stats will help with pagination details.

```ts
import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  type Account {
    email: String!
    role: Int!
    nested_details: NestedDetails!
  }

  type NestedDetails {
    age: Int!
    married: Boolean!
  }

  input GetAccountsInput {
    email: StringFilter
    role: [IntFilter] // Arrays Accepted
    nested_details: NestedDetailsInput // Nested Details Accepted
  }

  input NestedDetailsInput {
    age: IntFilter
    married: BooleanFilter
  }

  type GetAccountsResponse {
    stats: Stats
    Account: [Account] # The key is named from the name of the associated Mongoose Model.
  }

  extend type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

### 3. Convert Filter and/or use `FindWithPagination`

Use the `GenerateMongoFilter` function to convert the request body to a Mongo Filter. The result can then be used as the filter parameter in the document model functions.

```ts
// Generate Mongo Filter without Pagination Example

import { GenerateMongoFilter } from '@nickisyourfan/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    // Convert args to mongo filter.
    const { filters } = GenerateMongoFilter({
      args: args.getAllUsersInput,
    });

    // Use filters to find the requested documents
    const accounts = await Account.find(filter);

    return accounts;
  },
};
```

```ts
// Generate Mongo Filter WITH Pagination Example

import {
  GenerateMongoFilter,
  FindWithPagination,
} from '@nickisyourfan/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    // Convert args to mongo filter.
    const { filters } = GenerateMongoFilter({
      args: args.getAllUsersInput,
    });

    // Use filters to find the requested documents
    const accounts = await FindWithPagination({
      filters,
      options,
      model: Account,
    });

    return accounts;
  },
};
```

## Reference

### Field Filters

Use Field Filters to type GraphQL input properties within the schema, allowing the client to have control over the data it is requesting.

IntFieldFilter

```ts
type IntFieldFilter = {
  filterBy: 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';
  int: number;
};
```

StringFieldFilter

```ts
type StringFieldFilter = {
  filterBy: 'MATCH' | 'REGEX' | 'OBJECTID';
  string: string;
};
```

BooleanFieldFilter

```ts
type BooleanFieldFilter = {
  filterBy: 'EQ' | 'NE';
  bool: Boolean;
};
```

```ts
import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  input GetAccountsInput {
    email: StringFilter
    role: [IntFilter] // Arrays Accepted
  }

  extend type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

### Filter Config

Use the `FilterConfig` type in order to allow the client to have more control over the data it is requesting.

```ts
export type FilterConfig = {
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  pagination?: Pagination | InputMaybe<Pagination>;
};
```

Place it within the input, similar to Field Filters.

```ts
import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  input GetAccountsInput {
    email: StringFilter
    config: FilterConfig
  }
`;
```

Pass the config to `GenerateMongoFilter` in order to allow clients to manipulate operator and pagination options.

### Stats

The `stats` type can be used as within a response definition in order to return helpful details about the request.

```ts
export type Stats = {
  remaining: Number;
  total: Number;
  page: Number;
};
```

```ts
import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  type GetAccountsResponse {
    stats: Stats
    Account: [Account]
  }

  extend type Query {
    getAccounts(getAccountsInput: GetAccountsInput): GetAccountsResponse!
  }
`;
```

## GenerateMongoFilter

Use `GenerateMongoFilter({...})` to generate usable filters from the Field Filters used from requests.
