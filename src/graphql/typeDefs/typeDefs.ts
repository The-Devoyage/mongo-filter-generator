import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar ObjectID

  # Filter Config
  input FilterConfig {
    operator: OperatorFieldConfigEnum
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
  }
  input StringFieldFilter {
    string: String!
    filterBy: StringFilterByEnum!
  }
  input BooleanFieldFilter {
    bool: Boolean!
    filterBy: BooleanFilterByEnum!
  }

  # Array Filters
  input IntArrayFilter {
    int: Int!
    filterBy: IntFilterByEnum!
    arrayOptions: ArrayFilterByEnum!
  }
  input StringArrayFilter {
    string: [String!]!
    filterBy: StringFilterByEnum!
    arrayOptions: ArrayFilterByEnum!
  }
  input BooleanArrayFilter {
    bool: Boolean!
    filterBy: BooleanFilterByEnum!
    arrayOptions: ArrayFilterByEnum!
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
