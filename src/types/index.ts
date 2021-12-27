export type IntFieldFilter = {
  filter: IntFieldFilterOptions;
  int: number;
};

export enum IntFieldFilterOptions {
  Eq = 'EQ',
  Gt = 'GT',
  Gte = 'GTE',
  Lt = 'LT',
  Lte = 'LTE',
  Ne = 'NE',
}

export type StringFieldFilter = {
  filter: StringFieldFilterOptions;
  string: string;
};

export enum StringFieldFilterOptions {
  Match = 'MATCH',
  Objectid = 'OBJECTID',
  Regex = 'REGEX',
}

export type BooleanFieldFilter = {
  bool: boolean;
  filter: BooleanFieldFilterOptions;
};

export enum BooleanFieldFilterOptions {
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

export type MFGFilters =
  | IntFieldFilter
  | IntFieldFilter[]
  | StringFieldFilter
  | StringFieldFilter[]
  | BooleanFieldFilter
  | BooleanFieldFilter[]
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
  filter?: MFGFilters;
  disabled: Boolean;
}
