import {
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  TableOptions,
  VisibilityState,
} from '@tanstack/react-table'
import * as React from 'react'

import {
  defaultDataTableState,
  resolveDataTableStateUpdate,
} from '@/lib/data-table/data-table-state'
import type {
  DataTableState,
  DataTableStateUpdater,
} from '@/lib/data-table/data-table-state'

export type UseDataTableOptions<TData> = {
  data: Array<TData>
  columns: Array<ColumnDef<TData, unknown>>
  /** Fully controlled state — product UI or URL owns every slice. */
  state?: Partial<DataTableState>
  /** Called when any controlled slice changes (ideal for URL/server sync). */
  onStateChange?: (updater: DataTableStateUpdater) => void
  /** Uncontrolled defaults when `state` slices are omitted. */
  initialState?: Partial<DataTableState>
  /** Server-driven row models skip client sorting/filtering/pagination. */
  manualSorting?: boolean
  manualFiltering?: boolean
  manualPagination?: boolean
  pageCount?: number
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  getRowId?: TableOptions<TData>['getRowId']
  meta?: TableOptions<TData>['meta']
}

export type UseDataTableResult<TData> = {
  table: Table<TData>
  state: DataTableState
  setState: (updater: DataTableStateUpdater) => void
}

function useControllableSlice<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (value: T) => void
): [T, OnChangeFn<T>] {
  const [uncontrolled, setUncontrolled] = React.useState(initial)
  const value = controlled ?? uncontrolled

  const setValue = React.useCallback<OnChangeFn<T>>(
    (updater) => {
      const next = functionalUpdate(updater, value)
      if (controlled === undefined) {
        setUncontrolled(next)
      }
      onChange?.(next)
    },
    [controlled, onChange, value]
  )

  return [value, setValue]
}

export function useDataTable<TData>({
  data,
  columns,
  state: controlledState,
  onStateChange,
  initialState,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  pageCount,
  enableRowSelection = true,
  enableMultiRowSelection = true,
  getRowId,
  meta,
}: UseDataTableOptions<TData>): UseDataTableResult<TData> {
  const base = React.useMemo(
    () => ({
      ...defaultDataTableState,
      ...initialState,
      ...controlledState,
    }),
    [controlledState, initialState]
  )

  const notify = React.useCallback(
    (
      slice: keyof DataTableState,
      value: DataTableState[keyof DataTableState]
    ) => {
      onStateChange?.({ [slice]: value })
    },
    [onStateChange]
  )

  const [sorting, setSorting] = useControllableSlice(
    controlledState?.sorting,
    base.sorting,
    (value) => notify('sorting', value)
  )
  const [columnFilters, setColumnFilters] = useControllableSlice(
    controlledState?.columnFilters,
    base.columnFilters,
    (value) => notify('columnFilters', value)
  )
  const [columnVisibility, setColumnVisibility] = useControllableSlice(
    controlledState?.columnVisibility,
    base.columnVisibility,
    (value) => notify('columnVisibility', value)
  )
  const [rowSelection, setRowSelection] = useControllableSlice(
    controlledState?.rowSelection,
    base.rowSelection,
    (value) => notify('rowSelection', value)
  )
  const [pagination, setPagination] = useControllableSlice(
    controlledState?.pagination,
    base.pagination,
    (value) => notify('pagination', value)
  )
  const [globalFilter, setGlobalFilter] = useControllableSlice(
    controlledState?.globalFilter,
    base.globalFilter,
    (value) => notify('globalFilter', value)
  )

  const tableState: DataTableState = {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    globalFilter,
  }

  const setState = React.useCallback(
    (updater: DataTableStateUpdater) => {
      const next = resolveDataTableStateUpdate(tableState, updater)
      setSorting(next.sorting)
      setColumnFilters(next.columnFilters)
      setColumnVisibility(next.columnVisibility)
      setRowSelection(next.rowSelection)
      setPagination(next.pagination)
      setGlobalFilter(next.globalFilter)
      onStateChange?.(updater)
    },
    [
      onStateChange,
      setColumnFilters,
      setColumnVisibility,
      setGlobalFilter,
      setPagination,
      setRowSelection,
      setSorting,
      tableState,
    ]
  )

  const table = useReactTable({
    data,
    columns,
    state: tableState,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount,
    enableRowSelection,
    enableMultiRowSelection,
    getRowId,
    meta,
  })

  return { table, state: tableState, setState }
}

export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
}
