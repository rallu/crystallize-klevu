import { FilteredProducts } from '../components/search/filtered-products';
import { useAppContext } from '../app-context/provider';
import { ProductSlim } from '~/use-cases/contracts/Product';
import { FilterManager, KlevuApiRawResponse, KlevuDomEvents, KlevuFetch, KlevuFetchQueryResult, KlevuHydratePackedFetchResult, KlevuListenDomEvent, KlevuRecord, search } from '@klevu/core';
import { useEffect, useState } from 'react';
import { KlevuFacetList, KlevuPagination, KlevuProduct, KlevuProductGrid } from '@klevu/ui-react';
import { LinksFunction } from '@remix-run/node';
import { basicSearch } from '~/use-cases/search/basicsearch';

const manager = new FilterManager()

export default ({ data } : { data: KlevuApiRawResponse}) => {
    const { _t } = useAppContext();
    const [products, setProducts] = useState<KlevuRecord[]>([])
    const [result, setResult] = useState<KlevuFetchQueryResult | undefined>(undefined)
    const [pageIndex, setPageIndex] = useState(0)

    const unpackServerResults = async () => {
        const p = new URLSearchParams(window.location.search);
        const res = await KlevuHydratePackedFetchResult(data, basicSearch(p.get("q") ?? '', pageIndex, manager))
        setResult(res.queriesById("search"))
        setProducts(res.queriesById("search")?.records ?? [])
    }

    const doSearch = async () => {
        const p = new URLSearchParams(window.location.search);
        const res = await KlevuFetch(...basicSearch(p.get('q') ?? '', pageIndex, manager))
        setResult(res.queriesById("search"))
        setProducts(res.queriesById("search")?.records ?? [])
    }

    useEffect(() => {
        const stop = KlevuListenDomEvent(KlevuDomEvents.FilterSelectionUpdate, () => { doSearch() })
        unpackServerResults()

        return () => { 
            stop()
        }
    }, [])

    return (
        <div className="container px-6 mx-auto w-full">
            <h1 className="font-bold text-4xl mt-10">{_t('search.label')}</h1>
            <div className="flex">
                <KlevuFacetList manager={manager} />
                <KlevuProductGrid className="px-8">
                    {products.map((p, index) => <KlevuProduct key={index} product={p} fixedWidth />)}
                </KlevuProductGrid>
            </div>
            {result ? (
                <div className="py-4">
                    <KlevuPagination onKlevuPaginationChange={(e) => {
                        setPageIndex(e.detail - 1)
                        doSearch()
                    }} queryResult={result} />
                </div>
            ) : null}
        </div>
    );
};
