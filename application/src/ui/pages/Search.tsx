import { FilteredProducts } from '../components/search/filtered-products';
import { useAppContext } from '../app-context/provider';
import { ProductSlim } from '~/use-cases/contracts/Product';
import {
    FilterManager,
    KlevuApiRawResponse,
    KlevuDomEvents,
    KlevuFetch,
    KlevuFetchQueryResult,
    KlevuHydratePackedFetchResult,
    KlevuListenDomEvent,
    KlevuRecord,
    search,
} from '@klevu/core';
import { useEffect, useState } from 'react';
import {
    KlevuFacetList,
    KlevuPagination,
    KlevuProduct,
    KlevuProductGrid,
    KlevuSearchLandingPage,
} from '@klevu/ui-react';
import { LinksFunction } from '@remix-run/node';
import { basicSearch } from '~/use-cases/search/basicsearch';
import { KlevuFilter } from '../components/search/klevu-filter';
import KlevuProductToSlimProducts from '~/use-cases/mapper/Object/KlevuProductToSlimProducts';

const manager = new FilterManager();

export default ({ data }: { data: { response: KlevuApiRawResponse; searchTerm: string } }) => {
    const { _t } = useAppContext();

    const [products, setProducts] = useState<KlevuRecord[]>([]);
    const [result, setResult] = useState<KlevuFetchQueryResult | undefined>(undefined);
    const [pageIndex, setPageIndex] = useState(0);

    const unpackServerResults = async () => {
        const res = await KlevuHydratePackedFetchResult(
            data.response,
            basicSearch(data.searchTerm, pageIndex, manager),
        );
        setResult(res.queriesById('search'));
        setProducts(res.queriesById('search')?.records ?? []);
    };

    const doSearch = async () => {
        const res = await KlevuFetch(...basicSearch(data.searchTerm, pageIndex, manager));
        setResult(res.queriesById('search'));
        setProducts(res.queriesById('search')?.records ?? []);
    };

    useEffect(() => {
        const stop = KlevuListenDomEvent(KlevuDomEvents.FilterSelectionUpdate, () => {
            doSearch();
        });
        unpackServerResults();

        return () => {
            stop();
        };
    }, []);

    return (
        <>
            <div className="container 2xl px-5 mx-auto w-full">
                <h1 className="text-3xl font-bold mt-10 mb-4">Seach results</h1>
            </div>
            <div className={`container 2xl mt-2 px-5 mx-auto w-full`}>
                <KlevuFilter manager={manager} />
                <FilteredProducts
                    products={products.map((p) => KlevuProductToSlimProducts(p)) ?? []}
                />
            </div>
        </>
    );
};
