import { applyFilterWithManager, FilterManager, listFilters, search, sendSearchEvent } from '@klevu/core';

export function basicSearch(term: string, pageIndex: number, manager: FilterManager) {
    return [
        search(
            term ?? '',
            { limit: 24, offset: pageIndex * 24 },
            applyFilterWithManager(manager),
            listFilters({ filterManager: manager, rangeFilterSettings: [{ key: 'klevu_price', minMax: true }] }),
            sendSearchEvent(),
        ),
    ];
}
