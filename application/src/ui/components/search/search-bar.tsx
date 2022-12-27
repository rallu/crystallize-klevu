import { useEffect, useRef, useState } from 'react';
import SearchIcon from '~/assets/searchIcon.svg';
import { DebounceInput } from 'react-debounce-input';
import Link from '../../bridge/Link';
import { Image } from '@crystallize/reactjs-components';
import { useAppContext } from '../../app-context/provider';
import { createClient } from '@crystallize/js-api-client';
import { ProductSlim } from '~/use-cases/contracts/Product';
import { Price } from '../price';
import search from '~/use-cases/crystallize/read/search';
import searchProductToProductSlim from '~/use-cases/mapper/API/searchProductToProductSlim';
import { KlevuFetch, KlevuRecord, suggestions as KlevuSuggestions, search as KlevuSearch, trendingProducts, KlevuFetchQueryResult } from '@klevu/core';

export const SearchBar = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [show, setShow] = useState(false);
    const [queryResult, setSearchResult] = useState<KlevuFetchQueryResult | undefined>(undefined)
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [products, setProducts] = useState<KlevuRecord[]>([]);
    const [trending, setTrending] = useState<KlevuRecord[]>([]);
    const { state: appContextState, path, _t } = useAppContext();
    const apiClient = createClient({ tenantIdentifier: appContextState.crystallize.tenantIdentifier });
    //close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            setShow(true);
        };
    }, [ref]);

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        try {
            const result = await KlevuFetch(KlevuSuggestions(value), KlevuSearch(value))
            setSearchResult(result.queriesById("search"))
            setProducts(result.queriesById("search")?.records ?? [])
            setSuggestions(result.suggestionsById("suggestions")?.suggestions.map(s => s.suggest) ?? [])
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code == 'Enter') {
            window.location.replace(path(`/search?q=${searchTerm}`));
        }
    };

    const onSearchProductClick = async (product: KlevuRecord) => {
        queryResult?.getSearchClickSendEvent?.()(product.id)
    }

    const findTrendingProducts = async () => {
        const result = await KlevuFetch(trendingProducts({ id: "trending" }))
        setTrending(result.queriesById("trending")?.records ?? [])
    }

    useEffect(() => {
        findTrendingProducts()
    }, [])

    return (
        <div className="xl:w-[340px] md:px-4 relative 270px">
            <div className="relative z-30 flex items-center justify-between bg-grey h-10 rounded-full overflow-hidden focus-within:border">
                <DebounceInput
                    minLength={2}
                    placeholder={_t('search.placeholder')}
                    debounceTimeout={200}
                    onChange={handleChange}
                    className="bg-grey rounded-full overflow-hidden focus:border-textBlack outline-none px-6 w-full placeholder:text-[14px] placeholder:italic "
                    onKeyDown={handleKeyPress}
                    aria-label="Search"
                />
                <Link
                    to={path(`/search?q=${searchTerm}`)}
                    className="w-10 p-4 h-full text-[#fff] flex justify-center items-center rounded-full"
                >
                    <img src={`${SearchIcon}`} alt="search icon" width="15" height="15" />
                </Link>
            </div>
            {(suggestions.length > 0 || products.length > 0 || trending.length > 0) && show ? (
                <div
                    ref={ref}
                    className="absolute rounded-xl bg-[#fff] -top-5 w-96 pt-20 pb-2 border border-[#dfdfdf] left-0 overflow-y-scroll shadow-sm z-20"
                >
                    <div className="max-h-[400px] overflow-y-scroll flex w-full px-2">
                        <div>
                            <h3 className="font-bold">Search suggestions</h3>
                            {suggestions.map((suggestion, index) => (<div key={index} dangerouslySetInnerHTML={{ __html: suggestion }}></div>))}
                        </div>
                        {products.length > 0 ? (
                            <div>
                                <h3 className="font-bold">Found products</h3>
                                {products.map((product, index) => (<div key={index}>
                                    <Link
                                        to={path(product.url)}
                                        onClick={() => {
                                            setSuggestions([]);
                                            onSearchProductClick(product)
                                        }}
                                        prefetch="intent"
                                    >
                                        <div className="py-1 px-4 bg-[#fff] flex gap-2 items-center hover:bg-grey2">
                                            <div className="w-[25px] h-[35px] img-container rounded-sm img-cover border border-[#dfdfdf]">
                                                <Image
                                                    src={product.imageUrl}
                                                    sizes="100px"
                                                    fallbackAlt={product.name}
                                                />
                                            </div>
                                            <div className="flex justify-between w-full">
                                                <span className="text-sm ">{product.name}</span>
                                                <span className="text-sm font-bold">
                                                    {product.salePrice}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>))}
                            </div>
                        ) : trending.length > 0 ? (
                            <div>
                                <h3 className="font-bold">Trending products</h3>
                                {trending.map((product, index) => (<div key={index}>
                                    <Link
                                        to={path(product.url)}
                                        onClick={() => {
                                            setSuggestions([]);
                                        }}
                                        prefetch="intent"
                                    >
                                        <div className="py-1 px-4 bg-[#fff] flex gap-2 items-center hover:bg-grey2">
                                            <div className="w-[25px] h-[35px] img-container rounded-sm img-cover border border-[#dfdfdf]">
                                                <Image
                                                    src={product.imageUrl}
                                                    sizes="100px"
                                                    fallbackAlt={product.name}
                                                />
                                            </div>
                                            <div className="flex justify-between w-full">
                                                <span className="text-sm ">{product.name}</span>
                                                <span className="text-sm font-bold">
                                                    {product.salePrice}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>))}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
