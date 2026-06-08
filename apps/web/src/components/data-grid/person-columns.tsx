import type { ColumnDef } from '@tanstack/react-table'

import { createSelectColumn } from '@/lib/data-table/data-table-columns'
import type { Person } from '@/components/data-grid/sample-data'

export const personColumns: Array<ColumnDef<Person, unknown>> = [
  createSelectColumn<Person>(),
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    filterFn: 'equalsString',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ getValue }) => getValue<string>(),
  },
]
