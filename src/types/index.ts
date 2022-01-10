import { Model, FilterQuery } from 'mongoose';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  ObjectID: any;
};

// Filter Config
export type FilterConfig = {
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  pagination?: Pagination | InputMaybe<Pagination>;
};
export type OperatorOptions = 'AND' | 'OR';

export type Pagination = {
  limit?: InputMaybe<number> | number;
  reverse?: boolean | InputMaybe<boolean>;
  createdAt?: Scalars['DateTime'];
};

export interface FieldRule {
  location: String;
  fieldFilter?: FieldFilter | ArrayFilter;
  disabled?: Boolean;
}

// Filters
export type Filters = FieldFilter | ArrayFilter | undefined;

export interface StringFilterBase {
  string: string | string[];
  filterBy: StringFilterByOptions;
}
export interface BooleanFilterBase {
  bool: boolean;
  filterBy: BooleanFilterByOptions;
}
export interface IntFilterBase {
  int: number;
  filterBy: IntFilterByOptions;
}

export type FieldFilter =
  | IntFieldFilter
  | IntFieldFilter[]
  | StringFieldFilter
  | StringFieldFilter[]
  | BooleanFieldFilter
  | BooleanFieldFilter[];

export type ArrayFilter = StringArrayFilter | StringArrayFilter[];
//| IntArrayFilter
//| BooleanArrayFilter
//| IntArrayFilter[]
//| BooleanArrayFilter[];

// Field Filters
export type IntFieldFilter = IntFilterBase;
export type StringFieldFilter = StringFilterBase;
export type BooleanFieldFilter = BooleanFilterBase;

// Array Filters
export interface StringArrayFilter extends StringFilterBase {
  arrayOptions: ArrayFilterByOptions;
}

// FilterBy Options
export type IntFilterByOptions = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';
export type StringFilterByOptions = 'MATCH' | 'OBJECTID' | 'REGEX';
export type BooleanFilterByOptions = 'EQ' | 'NE';
export type ArrayFilterByOptions = 'IN' | 'NIN';

// Arguments
export interface GenerateMongoArguments<FieldFilters> {
  fieldFilters: FieldFilters;
  config?: FilterConfig | InputMaybe<FilterConfig>;
  fieldRules?: FieldRule[];
}

export interface GenerateFilterArguments<UnparsedFieldFilter> {
  unparsedFieldFilter: UnparsedFieldFilter;
  location: string;
  filters: FilterQuery<any>;
  operator: OperatorOptions;
  fieldRules?: FieldRule[];
}

export interface FindWithPaginationParams<ModelType> {
  model: Model<ModelType>;
  filters: Record<any, any>;
  options: Record<any, any>;
}

export interface FindAndPaginateModel extends Model<any> {
  findAndPaginate: <T>(
    filters: FilterQuery<any>,
    options: Record<any, any>
  ) => Promise<PaginatedResponse<T>>;
}

// Response
export type Stats = {
  remaining?: Maybe<Scalars['Int']> | number;
  total?: Maybe<Scalars['Int']> | number;
  page?: Maybe<Scalars['Int']> | number;
};

export interface PaginatedResponse<ModelType> {
  stats?: Stats;
  data?: ModelType[];
}
