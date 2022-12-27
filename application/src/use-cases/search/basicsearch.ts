import { applyFilterWithManager, FilterManager, listFilters, search } from "@klevu/core";

export function basicSearch(term: string, pageIndex: number,  manager: FilterManager) {
  return [
    search(term ?? '', { limit: 24, offset: pageIndex * 24 }, applyFilterWithManager(manager), listFilters({ filterManager: manager }))
  ]
}