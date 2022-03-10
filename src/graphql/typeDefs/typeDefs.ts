import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar ObjectID

  # Filter Config
  input FilterConfig {
    pagination: Pagination
  }
  input Pagination {
    limit: Int
    reverse: Boolean
    createdAt: DateTime
  }
  enum OperatorFieldConfigEnum {
    AND
    OR
  }

  # Field Filters
  input IntFieldFilter {
    int: Int!
    filterBy: IntFilterByEnum!
    operator: OperatorFieldConfigEnum
  }
  input StringFieldFilter {
    string: String!
    filterBy: StringFilterByEnum!
    operator: OperatorFieldConfigEnum
  }
  input BooleanFieldFilter {
    bool: Boolean!
    filterBy: BooleanFilterByEnum!
    operator: OperatorFieldConfigEnum
  }

  # Array Filters
  input StringArrayFieldFilter {
    string: [String!]!
    filterBy: StringFilterByEnum!
    arrayOptions: ArrayFilterByEnum!
    operator: OperatorFieldConfigEnum
  }

  # FilterBy Options
  enum BooleanFilterByEnum {
    EQ
    NE
  }
  enum IntFilterByEnum {
    EQ
    GT
    LT
    GTE
    LTE
    NE
  }
  enum StringFilterByEnum {
    REGEX
    MATCH
    OBJECTID
  }
  enum ArrayFilterByEnum {
    IN
    NIN
  }

  # Response Typings
  type Stats {
    remaining: Int
    total: Int
    page: Int
    cursor: DateTime
  }
`;
