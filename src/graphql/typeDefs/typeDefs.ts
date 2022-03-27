import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar ObjectID

  # Filter Config
  """
  Global configuration details.
  """
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

  """
  Filter for documents which have a property that is an Integer.
  """
  input IntFieldFilter {
    int: Int!
    filterBy: IntFilterByEnum!
    operator: OperatorFieldConfigEnum
    groups: [String!]
  }

  """
  Filter for documents which have a property that is a string. Filter by REGEX, ObjectID, or Match.
  """
  input StringFieldFilter {
    string: String!
    filterBy: StringFilterByEnum!
    operator: OperatorFieldConfigEnum
    groups: [String!]
  }
  """
  Filter for documents which have a property that is a Boolean.
  """
  input BooleanFieldFilter {
    bool: Boolean!
    filterBy: BooleanFilterByEnum!
    operator: OperatorFieldConfigEnum
    groups: [String!]
  }
  """
  Filter for documents which have a property that is a Date.
  """
  input DateFieldFilter {
    date: DateTime!
    filterBy: DateFilterByEnum!
    operator: OperatorFieldConfigEnum
    groups: [String!]
  }

  # Array Filters
  """
  Filter for documents which have a property that is an array of strings..
  """
  input StringArrayFieldFilter {
    string: [String!]!
    filterBy: StringFilterByEnum!
    arrayOptions: ArrayFilterByEnum!
    operator: OperatorFieldConfigEnum
    groups: [String!]
  }

  # FilterBy Options
  """
  Equal or Not Equal
  """
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
  enum DateFilterByEnum {
    EQ
    GT
    LT
    GTE
    LTE
    NE
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
