# Mongo Filter Generator

## Features

This package automatically transforms requests from client applications into
filters for mongo.

- Standardizes filters for requests made from client to api.
- Less logic in api filters as it is all reusable.
- More control over each property of each document.
- Easy to install, setup, and implement with minimal code.

## Example Query

After adding the few lines of setup boilerplate code to your API, the client instantly will be able to request filtered documents without hassle.

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

More or less this is for projects which use GraphQL. You will need to add the SDL to your typeDefs. Apollo example:

```ts
import { SDL } from '@nickisyourfan/mongo-filter-generator';
import { typeDefs, resolvers } from './graphql';

const schema = buildFederatedSchema([
  { typeDefs, resolvers },
  { typeDefs: SDL }, // Add the MFG TypeDefs to your schema.
]);
```

### 2. Add Filters To Schema

Filters are inputs in graphql or the request body within a REST api. Below, we define the input fields that are to be used as the filters, such as IntFilter or StringFilter.

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

  extend type Query {
    getAccounts(getAccountsInput: GetAccountsInput): [Account!]!
  }
`;
```

### 3. Convert Filter

Use the `GenerateMongoFilter` function to convert the request body to a mongo filter. The result can then be used as the filter parameter in the document model functions.

```ts
import { GenerateMongoFilter } from '@nickisyourfan/mongo-filter-generator';
import { Account } from 'models';

export const Query: QueryResolvers = {
  getAccounts: async (_, args) => {
    // Convert args to mongo filter.
    const filter = GenerateMongoFilter({
      args: args.getAllUsersInput,
      // Root of object should match the document model.
    });

    // Use filter to find the requested documents
    const accounts = await Account.find(filter);

    return accounts;
  },
};
```

## Reference

### Field Filters

Use filters to type `request.body` or GraphQL `input` types, allowing your client to have control over the data it requests. This package provides the following Field Filters:

- IntFilter
  - Filter by comparing requested integer to the available document fields.
  - Options: EQ | NE | LT | GT | LTE | GTE
- StringFilter
  - Filter by comparing requested string with the available document fields.
  - Options: MATCH, OBJECTID, REGEX(partial match)
- BooleanFilter
  - Filter by comparing requested boolean with available document fields.
  - Options: EQ | NE
