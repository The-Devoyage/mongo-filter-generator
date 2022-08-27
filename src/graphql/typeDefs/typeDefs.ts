import { gql } from "apollo-server-core";

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar ObjectID
  scalar JWT
  scalar EmailAddress
  scalar PhoneNumber
  scalar PostalCode
  scalar CountryCode

  # Filter Config
  """
  Global configuration details.
  """
  input FilterConfig {
    pagination: Pagination
    history: HistoryFilterInput
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

  enum HistoryFilterIntervalEnum {
    YEAR
    DAY_OF_YEAR
    MONTH
    DAY_OF_MONTH
    WEEK
    DAY_OF_WEEK
    HOUR
    MINUTES
    SECONDS
    MILLISECONDS
  }

  input HistoryFilterInput {
    interval: [HistoryFilterIntervalEnum!]!
  }

  type HistoricStatsId {
    YEAR: Int @shareable
    DAY_OF_YEAR: Int @shareable
    MONTH: Int @shareable
    DAY_OF_MONTH: Int @shareable
    WEEK: Int @shareable
    DAY_OF_WEEK: Int @shareable
    HOUR: Int @shareable
    MINUTES: Int @shareable
    SECONDS: Int @shareable
    MILLISECONDS: Int @shareable
  }

  type HistoricStats {
    _id: HistoricStatsId @shareable
    total: Int @shareable
  }

  type Stats {
    remaining: Int @shareable
    total: Int @shareable
    page: Int @shareable
    cursor: DateTime @shareable
    history: [HistoricStats!] @shareable
  }
`;
