'use client'

import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyState?: React.ReactNode
  onSort?: (key: string) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyState,
  onSort,
  sortKey,
  sortDirection = 'asc',
  onRowClick,
}: DataTableProps<T>) {
  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/50 border-b border-[#90BCC5]/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-[#08333D]"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#90BCC5]/30">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse bg-white/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4">
                    <div className="h-4 bg-white/75 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-12 text-center text-[#08333D]">
        {emptyState || (
          <div>
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm mt-1">There are no records to display</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/50 border-b border-[#90BCC5]/40">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-left text-sm font-semibold text-[#08333D] ${
                  column.sortable ? 'cursor-pointer hover:bg-white/50 select-none' : ''
                } ${column.className || ''}`}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-[#08333D]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#90BCC5]/30 bg-white/10">
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-white/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 text-sm text-[#08333D] ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(item, index)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
