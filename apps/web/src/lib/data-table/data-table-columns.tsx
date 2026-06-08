import type { ColumnDef, Row, Table } from '@tanstack/react-table'
import * as React from 'react'

export function createSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <SelectAllCheckbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(value) => table.toggleAllPageRowsSelected(value)}
        label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <SelectRowCheckbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(value) => row.toggleSelected(value)}
        label={`Select row ${row.index + 1}`}
      />
    ),
  }
}

type CheckboxProps = {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
  label: string
}

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !checked)
    }
  }, [checked, indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  )
}

function SelectRowCheckbox({
  checked,
  disabled,
  onChange,
  label,
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  )
}

/** Headless sort toggle — returns ARIA props for any header control. */
export function getSortHeaderProps<TData>({
  column,
}: {
  column: ReturnType<Table<TData>['getAllColumns']>[number]
}) {
  const sorted = column.getIsSorted()
  return {
    'aria-sort':
      sorted === 'asc'
        ? ('ascending' as const)
        : sorted === 'desc'
          ? ('descending' as const)
          : ('none' as const),
    onClick: column.getToggleSortingHandler(),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        column.toggleSorting()
      }
    },
    tabIndex: 0,
    role: 'columnheader' as const,
  }
}

export function getSelectedRowIds<TData>(table: Table<TData>): Array<string> {
  return table.getFilteredSelectedRowModel().rows.map((row) => row.id)
}

export function getSelectedRows<TData>(table: Table<TData>): Array<Row<TData>> {
  return table.getFilteredSelectedRowModel().rows
}
