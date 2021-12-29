export type FieldFilterConfig = {
  includeEmptyResults?: boolean;
};

export type IntFieldFilter = {
  filterBy: IntFieldFilterOptions;
  int: number;
  config?: FieldFilterConfig;
};

export type IntFieldFilterOptions = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';

export type StringFieldFilter = {
  filterBy: StringFieldFilterOptions;
  string: string;
  config?: FieldFilterConfig;
};

export type StringFieldFilterOptions = 'MATCH' | 'OBJECTID' | 'REGEX';

export type BooleanFieldFilter = {
  bool: boolean;
  filterBy: BooleanFieldFilterOptions;
  config?: FieldFilterConfig;
};

export type BooleanFieldFilterOptions = 'EQ' | 'NE';

export type Pagination = {
  limit: number;
  reverse?: boolean;
  createdAt?: Date;
};

export type FilterConfig = {
  operator?: OperatorOptions;
  pagination?: Pagination;
};

export type OperatorOptions = 'AND' | 'OR';

export type FieldFilter =
  | IntFieldFilter
  | IntFieldFilter[]
  | StringFieldFilter
  | StringFieldFilter[]
  | BooleanFieldFilter
  | BooleanFieldFilter[]
  | undefined;

export interface GenerateMongoFilterArguments<FieldFilters> {
  fieldFilters: FieldFilters;
  config?: FilterConfig;
  fieldRules?: FieldRule[];
}

export interface GenerateFieldsArguments<UnparsedFieldFilter> {
  unparsedFieldFilter: UnparsedFieldFilter;
  location: string;
  filters: Record<any, any>;
  operator: OperatorOptions;
  fieldRules?: FieldRule[];
}

export interface FieldRule {
  location: String;
  fieldFilter?: FieldFilter;
  disabled?: Boolean;
}
