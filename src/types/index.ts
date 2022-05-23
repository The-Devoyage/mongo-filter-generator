import { Model, FilterQuery, ObjectId, QueryOptions } from "mongoose";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  ObjectID: ObjectId;
};

// Filter Config
export type FilterConfig = {
  pagination?: Pagination | InputMaybe<Pagination>;
};

export type OperatorOptions = "AND" | "OR";

export type Pagination = {
  limit?: InputMaybe<number> | number;
  reverse?: boolean | InputMaybe<boolean>;
  createdAt?: InputMaybe<Date> | Date;
};

export interface FieldRule {
  location: string;
  fieldFilter?: FieldFilter;
  action: "DISABLE" | "OVERRIDE" | "COMBINE" | "INITIAL";
}

// Filters
export type FieldFilter =
  | IntFieldFilter
  | StringFieldFilter
  | BooleanFieldFilter
  | DateFieldFilter
  | StringArrayFieldFilter;

export interface StringFilterBase {
  string: string | string[];
  filterBy: StringFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  groups?: string[];
}
export interface BooleanFilterBase {
  bool: boolean;
  filterBy: BooleanFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  groups?: string[];
}
export interface IntFilterBase {
  int: number;
  filterBy: IntFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  groups?: string[];
}
export interface DateFieldFilterBase {
  date: Date;
  filterBy: DateFilterByOptions;
  operator?: OperatorOptions | InputMaybe<OperatorOptions>;
  groups?: string[];
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
export type IntFilterByOptions = "EQ" | "GT" | "GTE" | "LT" | "LTE" | "NE";
export type StringFilterByOptions = "MATCH" | "OBJECTID" | "REGEX";
export type BooleanFilterByOptions = "EQ" | "NE";
export type DateFilterByOptions = "EQ" | "NE" | "GT" | "LT" | "GTE" | "LTE";
export type ArrayFilterByOptions = "IN" | "NIN";

// Arguments
export interface GenerateMongoArguments<DocumentType> {
  fieldFilters: Partial<Record<keyof DocumentType, object | null>>;
  config?: FilterConfig | InputMaybe<FilterConfig>;
  fieldRules?: FieldRule[];
}

export interface GenerateFilterArguments {
  fieldFilter?: FieldFilter;
}

export interface FindWithPaginationParams<ModelType> {
  model: Model<ModelType>;
  filter: Record<string, unknown>;
  options: QueryOptions;
  mfgOptions?: MfgOptions;
}

export interface MfgOptions {
  history?: { filter: HistoryFilterInput };
}

export interface FindAndPaginateModel extends Model<unknown> {
  findAndPaginate: <T>(
    filter: FilterQuery<unknown>,
    options: Record<string, unknown>,
    mfgOptions?: MfgOptions
  ) => Promise<PaginatedResponse<T>>;
}

export interface AddFilterArguments {
  filter: FilterQuery<unknown>;
  location: string;
  newFilter: FilterQuery<unknown>;
  operator?: OperatorOptions | null;
  arrayOptions?: ArrayFilterByOptions;
  groups?: string[];
}

// Response
export type Stats = {
  remaining?: Maybe<Scalars["Int"]> | number;
  total?: Maybe<Scalars["Int"]> | number;
  page?: Maybe<Scalars["Int"]> | number;
  cursor?: Maybe<Scalars["DateTime"]> | Date;
  history?: HistoricStats[];
};

export type HistoryFilterIntervalEnum =
  | "YEAR"
  | "DAY_OF_YEAR"
  | "MONTH"
  | "DAY_OF_MONTH"
  | "WEEK"
  | "DAY_OF_WEEK"
  | "HOUR"
  | "MINUTES"
  | "SECONDS"
  | "MILLISECONDS";

export type HistoryFilterInput = {
  interval: HistoryFilterIntervalEnum[];
};

export type HistoricStats = {
  total: Maybe<Scalars["Int"]> | number;
  _id: Record<HistoryFilterIntervalEnum, number>;
};

export interface PaginatedResponse<ModelType> {
  stats: Stats;
  data: ModelType[];
}
