# Changelog

## [v0.5.0]

### Added
- Type and Validation Support from the library `@the-devoyage/request-filter-language`
- Added logging for better debugging.
- Added default cases for filter query generation. Defaults to `MATCH` or `EQ` if `filterBy` property is not provided.
- Default operator options changed to `AND`
- Added `per_page` and `prev_cursor` to `Stats`.

### Removed
- GraphQL Types - You may now get the GraphQL Schema from `@the-devoyage/request-filter-language`.
- Validators - You may now import Validation Schemas from `@the-devoyage/request-filter-language`.
- Parse Field Filters - Now imported from `@the-devoyage/request-filter-language`.
- Typescript Types Associated with Field Filters - Now import from `@the-devoyage/request-filter-language`.

## [v0.4.0]

### Added
- GraphQL Scalars Library
- Historical Stats

### Changed
- GraphQL 16+
- Federation 2 Required

### Removed
- DateScalars Library 
