import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import { DataGridToolbar } from '@/components/data-grid/data-grid-toolbar'
import { DataTable } from '@/components/data-grid/data-table'
import { personColumns } from '@/components/data-grid/person-columns'
import { samplePeople } from '@/components/data-grid/sample-data'
import {
  dataTableStateToSearchParams,
  defaultDataTableState,
  mergeServerTableState,
  resolveDataTableStateUpdate,
  searchParamsToDataTableState,
} from '@/lib/data-table/data-table-state'
import type {
  DataTableSearchParams,
  DataTableState,
} from '@/lib/data-table/data-table-state'
import { useDataTable } from '@/lib/data-table/use-data-table'

const dataGridSearchSchema = z.object({
  sort: z.string().optional(),
  filters: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  q: z.string().optional(),
  columns: z.string().optional(),
})

export const Route = createFileRoute('/data-grid')({
  validateSearch: dataGridSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    const serverState = searchParamsToDataTableState(deps)
    return { serverState }
  },
  component: DataGridPage,
})

function DataGridPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-medium">Data grid</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          TanStack Table headless primitives with accessible markup. State can
          live in React, the URL, or a server loader — row selection stays
          client-side in the URL example.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium">Product-owned state</h2>
          <p className="text-sm text-muted-foreground">
            <code>useState</code> holds sorting, filters, pagination, and
            visibility. Good for modals, drawers, and ephemeral views.
          </p>
        </div>
        <LocalDataGrid />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium">URL-synchronized state</h2>
          <p className="text-sm text-muted-foreground">
            Loader parses search params into table state; navigation writes them
            back. Shareable, bookmarkable grid views.
          </p>
        </div>
        <UrlSyncedDataGrid />
      </section>
    </main>
  )
}

function LocalDataGrid() {
  const [tableState, setTableState] = React.useState<DataTableState>(
    defaultDataTableState
  )

  const { table, state } = useDataTable({
    data: samplePeople,
    columns: personColumns,
    state: tableState,
    onStateChange: (updater) =>
      setTableState((current) => resolveDataTableStateUpdate(current, updater)),
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <DataGridToolbar
        table={table}
        globalFilter={state.globalFilter}
        onGlobalFilterChange={(value) =>
          setTableState((current) => ({ ...current, globalFilter: value }))
        }
      />
      <DataTable table={table} caption="People directory" />
    </div>
  )
}

function UrlSyncedDataGrid() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { serverState } = Route.useLoaderData()

  const [rowSelection, setRowSelection] = React.useState<
    DataTableState['rowSelection']
  >({})

  const tableState = React.useMemo(
    () =>
      mergeServerTableState(serverState, {
        rowSelection,
      }),
    [rowSelection, serverState]
  )

  const syncToUrl = React.useCallback(
    (updater: Parameters<typeof resolveDataTableStateUpdate>[1]) => {
      const patch =
        typeof updater === 'function' ? updater(tableState) : updater

      if (patch.rowSelection !== undefined) {
        setRowSelection(patch.rowSelection)
        return
      }

      const next = resolveDataTableStateUpdate(tableState, patch)
      const params = dataTableStateToSearchParams(next)

      void navigate({
        search: (prev) => cleanSearchParams({ ...prev, ...params }),
        replace: true,
      })
    },
    [navigate, tableState]
  )

  const { table, state } = useDataTable({
    data: samplePeople,
    columns: personColumns,
    state: tableState,
    onStateChange: syncToUrl,
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <DataGridToolbar
        table={table}
        globalFilter={state.globalFilter}
        onGlobalFilterChange={(value) => syncToUrl({ globalFilter: value })}
      />
      <DataTable table={table} caption="People directory (URL state)" />
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(search, null, 2)}
      </pre>
    </div>
  )
}

function cleanSearchParams(
  params: DataTableSearchParams
): DataTableSearchParams {
  const cleaned: DataTableSearchParams = {}

  if (params.sort !== undefined) cleaned.sort = params.sort
  if (params.filters !== undefined) cleaned.filters = params.filters
  if (params.page !== undefined) cleaned.page = params.page
  if (params.pageSize !== undefined) cleaned.pageSize = params.pageSize
  if (params.q !== undefined) cleaned.q = params.q
  if (params.columns !== undefined) cleaned.columns = params.columns

  return cleaned
}
