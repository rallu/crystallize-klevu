import { HeadersFunction, json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { HttpCacheHeaderTaggerFromLoader, StoreFrontAwaretHttpCacheHeaderTagger } from '~/use-cases/http/cache';
import { getStoreFront } from '~/core/storefront.server';
import { getContext } from '~/use-cases/http/utils';
import Search from '~/ui/pages/Search';
import { KlevuFetch, search, KlevuPackFetchResult, FilterManager } from '@klevu/core';
import { basicSearch } from '~/use-cases/search/basicsearch';

export const headers: HeadersFunction = ({ loaderHeaders }) => {
    return HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers;
};

export const loader: LoaderFunction = async ({ request }) => {
    const requestContext = getContext(request);
    const { shared, secret } = await getStoreFront(requestContext.host);
    const params = requestContext.url.searchParams.get('q');

    const result = await KlevuFetch(...basicSearch(params ?? '', 0, new FilterManager()))
    const data = KlevuPackFetchResult(result)
    return json(
        { data: { response: data, searchTerm: params } },
        StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', ['search'], shared.config.tenantIdentifier),
    );
};

export default () => {
    const { data } = useLoaderData();
    return <Search data={data} />;
};
