import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  input FilterConfig {
    operator: OperatorFieldConfigEnum
    pagination: Pagination
  }

  input IntFieldFilter {
    int: Int!
    filterBy: IntFieldFilterEnum!
  }

  input StringFieldFilter {
    string: String!
    filterBy: StringFieldFilterEnum!
  }

  input BooleanFieldFilter {
    bool: Boolean!
    filterBy: BooleanFieldFilterEnum!
  }

  enum OperatorFieldConfigEnum {
    AND
    OR
  }

  enum BooleanFieldFilterEnum {
    EQ
    NE
  }

  enum IntFieldFilterEnum {
    EQ
    GT
    LT
    GTE
    LTE
    NE
  }

  enum StringFieldFilterEnum {
    REGEX
    MATCH
    OBJECTID
  }

  input Pagination {
    limit: Int!
    reverse: Boolean
    createdAt: Date
  }

  type QueryDetails {
    count: Int!
    totalPages: Int!
  }
`;
