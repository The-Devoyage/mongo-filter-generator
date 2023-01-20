import { Model, FilterQuery, ObjectId, QueryOptions } from "mongoose";
import {
  Stats,
  ArrayFilterByOptions,
  OperatorOptions,
  HistoryFilterInput,
  FieldFilter,
  FilterConfig,
} from "@the-devoyage/request-filter-language";

export type Maybe<T> = T | null;
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  ObjectID: ObjectId;
};

export interface FieldRule {
  location: string;
  fieldFilter?: FieldFilter;
  action: "DISABLE" | "OVERRIDE" | "COMBINE" | "INITIAL";
}

export interface GenerateMongoArguments<DocumentType> {
  fieldFilters: Partial<Record<keyof DocumentType, object | null>>;
  config?: FilterConfig;
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

export interface PaginatedResponse<ModelType> {
  stats: Stats;
  data: ModelType[];
}
