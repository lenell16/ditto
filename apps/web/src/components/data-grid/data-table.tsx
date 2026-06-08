import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'

import { getSortHeaderProps } from '@/lib/data-table/data-table-columns'
import { cn } from '@workspace/ui/lib/utils'

type DataTableProps<TData> = {
  table: Table<TData>
  caption?: string
  className?: string
}

/**
 * Accessible table markup renderer. TanStack Table owns row models and state;
 * this component only maps the instance to semantic HTML.
 */
export function DataTable<TData>({
  table,
  caption,
  className,
}: DataTableProps<TData>) {
  const rowCount = table.getRowModel().rows.length
  const colCount = table.getVisibleLeafColumns().length

  return (
    <table
      className={cn('w-full border-collapse text-sm', className)}
      aria-rowcount={rowCount}
      aria-colcount={colCount}
    >
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const sortProps = canSort
                ? getSortHeaderProps({ column: header.column })
                : { role: 'columnheader' as const }

              return (
                <th
                  key={header.id}
                  scope="col"
                  colSpan={header.colSpan}
                  className={cn(
                    'border-b border-border px-3 py-2 text-left font-medium',
                    canSort && 'cursor-pointer select-none'
                  )}
                  {...sortProps}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td
              colSpan={colCount}
              className="px-3 py-8 text-center text-muted-foreground"
            >
              No results.
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              aria-rowindex={rowIndex + 1}
              aria-selected={row.getIsSelected() || undefined}
              data-state={row.getIsSelected() ? 'selected' : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b border-border px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
