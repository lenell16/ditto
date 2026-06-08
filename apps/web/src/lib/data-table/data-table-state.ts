import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

/** Slices of table state that can be controlled externally. */
export type DataTableState = {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
  pagination: PaginationState
  globalFilter: string
}

export const defaultDataTableState: DataTableState = {
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  pagination: { pageIndex: 0, pageSize: 10 },
  globalFilter: '',
}

export type DataTableStateUpdater =
  | Partial<DataTableState>
  | ((state: DataTableState) => Partial<DataTableState>)

export function resolveDataTableStateUpdate(
  current: DataTableState,
  updater: DataTableStateUpdater
): DataTableState {
  const patch = typeof updater === 'function' ? updater(current) : updater
  return { ...current, ...patch }
}

/** Compact search-param shape for URL or server round-trips. */
export type DataTableSearchParams = {
  sort?: string
  filters?: string
  page?: number
  pageSize?: number
  q?: string
  columns?: string
}

const SORT_SEPARATOR = ','
const FILTER_SEPARATOR = ';'
const FILTER_KV_SEPARATOR = ':'

export function serializeSorting(sorting: SortingState): string | undefined {
  if (sorting.length === 0) return undefined
  return sorting
    .map(({ id, desc }) => `${id}${desc ? ':desc' : ':asc'}`)
    .join(SORT_SEPARATOR)
}

export function parseSorting(value: string | undefined): SortingState {
  if (!value) return []
  return value.split(SORT_SEPARATOR).map((entry) => {
    const [id, direction] = entry.split(':')
    return { id, desc: direction === 'desc' }
  })
}

export function serializeColumnFilters(
  filters: ColumnFiltersState
): string | undefined {
  if (filters.length === 0) return undefined
  return filters
    .map(({ id, value }) => `${id}${FILTER_KV_SEPARATOR}${String(value)}`)
    .join(FILTER_SEPARATOR)
}

export function parseColumnFilters(
  value: string | undefined
): ColumnFiltersState {
  if (!value) return []
  return value.split(FILTER_SEPARATOR).map((entry) => {
    const separatorIndex = entry.indexOf(FILTER_KV_SEPARATOR)
    const id = entry.slice(0, separatorIndex)
    const filterValue = entry.slice(separatorIndex + 1)
    return { id, value: filterValue }
  })
}

export function serializeColumnVisibility(
  visibility: VisibilityState
): string | undefined {
  const hidden = Object.entries(visibility)
    .filter(([, visible]) => visible === false)
    .map(([id]) => id)
  if (hidden.length === 0) return undefined
  return hidden.join(SORT_SEPARATOR)
}

export function parseColumnVisibility(
  value: string | undefined
): VisibilityState {
  if (!value) return {}
  return Object.fromEntries(
    value.split(SORT_SEPARATOR).map((id) => [id, false])
  )
}

export function dataTableStateToSearchParams(
  state: DataTableState
): DataTableSearchParams {
  return {
    sort: serializeSorting(state.sorting),
    filters: serializeColumnFilters(state.columnFilters),
    page:
      state.pagination.pageIndex > 0
        ? state.pagination.pageIndex + 1
        : undefined,
    pageSize:
      state.pagination.pageSize !== defaultDataTableState.pagination.pageSize
        ? state.pagination.pageSize
        : undefined,
    q: state.globalFilter || undefined,
    columns: serializeColumnVisibility(state.columnVisibility),
  }
}

export function searchParamsToDataTableState(
  params: DataTableSearchParams,
  base: DataTableState = defaultDataTableState
): DataTableState {
  return {
    ...base,
    sorting: parseSorting(params.sort),
    columnFilters: parseColumnFilters(params.filters),
    columnVisibility: parseColumnVisibility(params.columns),
    globalFilter: params.q ?? '',
    pagination: {
      pageIndex: Math.max(0, (params.page ?? 1) - 1),
      pageSize: params.pageSize ?? base.pagination.pageSize,
    },
  }
}

/** Merge loader/server state with client-owned slices (e.g. row selection). */
export function mergeServerTableState(
  server: Partial<DataTableState>,
  client: Partial<DataTableState>
): DataTableState {
  return {
    ...defaultDataTableState,
    ...server,
    ...client,
    pagination: {
      ...defaultDataTableState.pagination,
      ...server.pagination,
      ...client.pagination,
    },
  }
}
