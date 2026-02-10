'use client'

import React from 'react'

interface TableHeaderProps {
  title: string | React.ReactNode
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  filters?: React.ReactNode
  actionButtons?: React.ReactNode
  isLoading?: boolean
}

export function TableHeader({
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  filters,
  actionButtons,
  isLoading = false,
}: TableHeaderProps) {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {typeof title === 'string' ? (
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
          ) : (
            title
          )}
        </div>

        {actionButtons && (
          <div className="flex items-center gap-3">
            {actionButtons}
          </div>
        )}
      </div>

      {(onSearch || filters) && (
        <div className="flex flex-col md:flex-row gap-4">
          {onSearch && (
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
          
          {filters && (
            <div className="flex items-center gap-3">
              {filters}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
