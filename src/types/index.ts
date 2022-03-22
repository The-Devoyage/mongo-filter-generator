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
  pagination?: Pagination | InputMaybe<Pagination>;
};

export type OperatorOptions = 'AND' | 'OR';

export type Pagination = {
  limit?: InputMaybe<number> | number;
  reverse?: boolean | InputMaybe<boolean>;
  createdAt?: Scalars['DateTime'];
};

export interface FieldRule {
  location: string;
  fieldFilter?: FieldFilter;
  disabled?: boolean;
}

// Filters
export type FieldFilter =
  | IntFieldFilter
  | IntFieldFilter[]
  | StringFieldFilter
  | StringFieldFilter[]
  | BooleanFieldFilter
  | BooleanFieldFilter[]
  | DateFieldFilter
  | DateFieldFilter[]
  | StringArrayFieldFilter
  | StringArrayFieldFilter[]
  | undefined;

export interface StringFilterBase {
  string: string | string[];
  filterBy: StringFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
}
export interface BooleanFilterBase {
  bool: boolean;
  filterBy: BooleanFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
}
export interface IntFilterBase {
  int: number;
  filterBy: IntFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
}
export interface DateFieldFilterBase {
  date: Date;
  filterBy: DateFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
}

// Field Filters
export type IntFieldFilter = IntFilterBase;
export type StringFieldFilter = StringFilterBase;
export type BooleanFieldFilter = BooleanFilterBase;
export type DateFieldFilter = DateFieldFilterBase;

// Array Filters
export interface StringArrayFieldFilter extends StringFilterBase {
  arrayOptions: ArrayFilterByOptions;
}

// FilterBy Options
export type IntFilterByOptions = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'NE';
export type StringFilterByOptions = 'MATCH' | 'OBJECTID' | 'REGEX';
export type BooleanFilterByOptions = 'EQ' | 'NE';
export type DateFilterByOptions = 'EQ' | 'NE' | 'GT' | 'LT' | 'GTE' | 'LTE';
export type ArrayFilterByOptions = 'IN' | 'NIN';

// Arguments
export interface GenerateMongoArguments {
  fieldFilters: Record<any, any>;
  config?: FilterConfig | InputMaybe<FilterConfig>;
  fieldRules?: FieldRule[];
}

export interface GenerateFilterArguments {
  fieldFilter: FieldFilter;
  location: string;
  filter: FilterQuery<any>;
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
  cursor?: Maybe<Scalars['DateTime']> | Date;
};

export interface PaginatedResponse<ModelType> {
  stats: Stats;
  data: ModelType[];
}
