export type IntFilter = {
  filter: IntFilterEnum;
  int: number;
};

export enum IntFilterEnum {
  Eq = 'EQ',
  Gt = 'GT',
  Gte = 'GTE',
  Lt = 'LT',
  Lte = 'LTE',
  Ne = 'NE',
}

export type StringFilter = {
  filter: StringFilterEnum;
  string: string;
};

export enum StringFilterEnum {
  Match = 'MATCH',
  Objectid = 'OBJECTID',
  Regex = 'REGEX',
}

export type BooleanFilter = {
  bool: boolean;
  filter: BooleanFilterEnum;
};

export enum BooleanFilterEnum {
  Eq = 'EQ',
  Ne = 'NE',
}

export type FilterConfig = {
  operator: OperatorEnum;
};

export enum OperatorEnum {
  And = 'AND',
  Or = 'OR',
}

export type GMFFilterTypes =
  | IntFilter
  | IntFilter[]
  | StringFilter
  | StringFilter[]
  | BooleanFilter
  | BooleanFilter[]
  | undefined;

export interface GenerateMongoFilterArguments<ModelFilters> {
  modelFilters: ModelFilters;
  filterConfig?: FilterConfig | null;
  fieldRules?: FieldRule[];
}

export interface GenerateFieldsArguments<Arg> {
  arg: Arg;
  location: string;
  mongoFilter: any;
  operator: OperatorEnum;
  fieldRules?: FieldRule[];
}

export interface FieldRule {
  location: String;
  filter?: GMFFilterTypes;
  disabled: Boolean;
}
