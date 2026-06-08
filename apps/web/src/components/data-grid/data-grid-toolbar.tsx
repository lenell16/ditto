import type { Table } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { ChevronLeftIcon, ChevronRightIcon, Columns3Icon } from 'lucide-react'

import { getSelectedRowIds } from '@/lib/data-table/data-table-columns'

type DataGridToolbarProps<TData> = {
  table: Table<TData>
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

/**
 * Example product UI — owns no table logic, only calls table/state APIs.
 * Swap this out or restyle it; the headless hook stays the same.
 */
export function DataGridToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
}: DataGridToolbarProps<TData>) {
  const selectedCount = getSelectedRowIds(table).length
  const roleColumn = table.getColumn('role')
  const statusColumn = table.getColumn('status')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Filter rows"
          placeholder="Search all columns…"
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="max-w-xs"
        />

        {roleColumn ? (
          <Select
            value={
              typeof roleColumn.getFilterValue() === 'string'
                ? roleColumn.getFilterValue()
                : 'all'
            }
            onValueChange={(value) =>
              roleColumn.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-36" aria-label="Filter by role">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        ) : null}

        {statusColumn ? (
          <Select
            value={
              typeof statusColumn.getFilterValue() === 'string'
                ? statusColumn.getFilterValue()
                : 'all'
            }
            onValueChange={(value) =>
              statusColumn.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                <Columns3Icon data-icon="inline-start" />
                Columns
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {selectedCount > 0
            ? `${selectedCount} row${selectedCount === 1 ? '' : 's'} selected`
            : `${table.getFilteredRowModel().rows.length} row(s)`}
        </p>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Rows per page
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-20" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
