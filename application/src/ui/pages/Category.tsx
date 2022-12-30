import { Filter } from '../components/search/filter';
import { FilteredProducts } from '../components/search/filtered-products';
import { Grid } from '../components/grid/grid';
import { Category } from '../../use-cases/contracts/Category';
import { ProductSlim } from '../../use-cases/contracts/Product';
import {
    FilterManager,
    KlevuApiRawResponse,
    KlevuDomEvents,
    KlevuFetch,
    KlevuFetchResponse,
    KlevuHydratePackedFetchResult,
    KlevuListenDomEvent,
} from '@klevu/core';
import { categoryQuery } from '~/use-cases/search/categoryMerchandising';
import { useEffect, useState } from 'react';
import KlevuProductToSlimProducts from '~/use-cases/mapper/Object/KlevuProductToSlimProducts';
import { KlevuFilter } from '../components/search/klevu-filter';

const manager = new FilterManager();

export default ({
    data,
}: {
    data: {
        category: Category;
        products: ProductSlim[];
        priceRangeAndAttributes: any;
        klevu: KlevuApiRawResponse;
        folder: string;
    };
}) => {
    const { category, klevu, folder } = data;
    const [result, setKlevuResult] = useState<KlevuFetchResponse | undefined>(undefined);

    const unpackServerResults = async () => {
        setKlevuResult(
            await KlevuHydratePackedFetchResult(
                klevu,
                categoryQuery('women' /* replace with folder */, category.title, 0, manager),
            ),
        );
    };

    const doFrontEndSearch = async () => {
        const res = await KlevuFetch(...categoryQuery('women' /* replace with folder */, category.title, 0, manager));
        setKlevuResult(res);
    };

    useEffect(() => {
        unpackServerResults();

        const stop = KlevuListenDomEvent(KlevuDomEvents.FilterSelectionUpdate, (e) => {
            doFrontEndSearch();
        })

        return () => {
            stop()
        }
    }, []);

    return (
        <>
            <div className="container 2xl px-5 mx-auto w-full">
                <h1 className="text-3xl font-bold mt-10 mb-4">{category.title}</h1>
                <p className="w-3/5 mb-10">{category.description}</p>
            </div>
            {category.hero && (
                <div className="w-full mx-auto">
                    <Grid grid={category.hero} />
                </div>
            )}
            <div className={`container 2xl mt-2 px-5 mx-auto w-full ${category.hero ? 'mt-20 pt-10' : ''}`}>
                <KlevuFilter manager={manager} />
                <FilteredProducts
                    products={result?.queriesById('merc')?.records.map((p) => KlevuProductToSlimProducts(p)) ?? []}
                />
            </div>
        </>
    );
};
