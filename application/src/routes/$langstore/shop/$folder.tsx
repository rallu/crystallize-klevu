import { HeadersFunction, json, LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { HttpCacheHeaderTaggerFromLoader, StoreFrontAwaretHttpCacheHeaderTagger } from '~/use-cases/http/cache';
import sliderStyles from 'rc-slider/assets/index.css';
import { getStoreFront } from '~/core/storefront.server';
import { buildMetas } from '~/use-cases/MicrodataBuilder';
import { getContext } from '~/use-cases/http/utils';
import splideStyles from '@splidejs/splide/dist/css/themes/splide-default.min.css';
import videoStyles from '@crystallize/reactjs-components/assets/video/styles.css';
import Category from '~/ui/pages/Category';
import dataFetcherForShapePage from '~/core/dataFetcherForShapePage.server';
import { KlevuFetch, KlevuPackFetchResult, FilterManager } from '@klevu/core';
import { categoryQuery } from '~/use-cases/search/categoryMerchandising';

export const links: LinksFunction = () => {
    return [
        { rel: 'stylesheet', href: sliderStyles },
        { rel: 'stylesheet', href: splideStyles },
        { rel: 'stylesheet', href: videoStyles },
    ];
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
    return HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers;
};

export let meta: MetaFunction = ({ data }) => {
    return buildMetas(data);
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const requestContext = getContext(request);
    const path = `/shop/${params.folder}`;
    const { shared } = await getStoreFront(requestContext.host);
    const data: any = await dataFetcherForShapePage('category', path, requestContext, params);

    const result = await KlevuFetch(
        ...categoryQuery('women' /* replace with: params.folder*/, data.category.title, 0, new FilterManager()),
    );
    const klevu = KlevuPackFetchResult(result);

    return json(
        {
            data: {
                ...data,
                folder: params.folder,
                klevu,
            },
        },
        StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', [path], shared.config.tenantIdentifier),
    );
};

export default () => {
    const { data } = useLoaderData();
    return <Category data={data} />;
};
