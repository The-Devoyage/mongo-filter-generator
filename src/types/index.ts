export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

export type IntFieldFilter = {
  filterBy: IntFieldFilterOptions;
  int: number;
};

export type IntFieldFilterOptions = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';

export type StringFieldFilter = {
  filterBy: StringFieldFilterOptions;
  string: string;
};

export type StringFieldFilterOptions = 'MATCH' | 'OBJECTID' | 'REGEX';

export type BooleanFieldFilter = {
  bool: boolean;
  filterBy: BooleanFieldFilterOptions;
};

export type BooleanFieldFilterOptions = 'EQ' | 'NE';

export type Pagination = {
  limit: number;
  reverse?: boolean | InputMaybe<boolean>;
  createdAt?: Date;
};

export type FilterConfig = {
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  pagination?: Pagination | InputMaybe<Pagination>;
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
  config?: FilterConfig | InputMaybe<FilterConfig>;
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

export type QueryDetails = {
  count: Number;
  totalPages: Number;
};
