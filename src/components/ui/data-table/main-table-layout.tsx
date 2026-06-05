'use client'

import React from 'react'
import { TableHeader } from './table-header'
import { DataTable, Column } from './data-table'
import { TablePagination } from './table-pagination'

export interface MainTableLayoutProps<T> {
  title: string | React.ReactNode
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  filters?: React.ReactNode
  actionButtons?: React.ReactNode
  emptyState?: React.ReactNode
  pagination?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  onSort?: (key: string) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onRowClick?: (item: T) => void
}

export function MainTableLayout<T extends Record<string, any>>({
  title,
  columns,
  data,
  isLoading = false,
  searchPlaceholder,
  onSearch,
  filters,
  actionButtons,
  emptyState,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
}: MainTableLayoutProps<T>) {
  return (
    <div className="w-full flex flex-col gap-6">
      <TableHeader
        title={title}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        filters={filters}
        actionButtons={actionButtons}
        isLoading={isLoading}
      />

      <div className="bg-white/50 rounded-xl shadow-sm border border-[#90BCC5]/50 backdrop-blur-md">
        <div className="overflow-hidden rounded-t-xl">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            emptyState={emptyState}
            onSort={onSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onRowClick={onRowClick}
          />
        </div>

        {pagination && !isLoading && data.length > 0 && (onPageSizeChange || totalPages > 1) && (
          <div className="px-6 pb-4 border-t border-[#90BCC5]/40">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange || (() => {})}
              pageSize={pageSize}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={pageSizeOptions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
