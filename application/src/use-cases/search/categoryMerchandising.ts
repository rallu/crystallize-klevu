import {
    applyFilterWithManager,
    FilterManager,
    listFilters,
    categoryMerchandising,
    sendMerchandisingViewEvent,
} from '@klevu/core';

export function categoryQuery(category: string, categoryTitle: string, pageIndex: number, manager: FilterManager) {
    return [
        categoryMerchandising(
            category,
            { id: 'merc', limit: 24, offset: pageIndex * 24 },
            applyFilterWithManager(manager),
            listFilters({ filterManager: manager, rangeFilterSettings: [{ key: 'klevu_price', minMax: true }] }),
            sendMerchandisingViewEvent(categoryTitle),
        ),
    ];
}
