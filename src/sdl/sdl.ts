import { gql } from 'apollo-server-core';

export const SDL = gql`
  input FilterConfig {
    operator: OperatorEnum!
  }

  input IntFilter {
    int: Int!
    filter: IntFilterEnum!
  }

  input StringFilter {
    string: String!
    filter: StringFilterEnum!
  }

  input BooleanFilter {
    bool: Boolean!
    filter: BooleanFilterEnum!
  }

  enum OperatorEnum {
    AND
    OR
  }

  enum BooleanFilterEnum {
    EQ
    NE
  }

  enum IntFilterEnum {
    EQ
    GT
    LT
    GTE
    LTE
    NE
  }

  enum StringFilterEnum {
    REGEX
    MATCH
    OBJECTID
  }
`;
