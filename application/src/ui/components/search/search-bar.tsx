import { useEffect, useRef, useState } from 'react';
import SearchIcon from '~/assets/searchIcon.svg';
import { DebounceInput } from 'react-debounce-input';
import Link from '../../bridge/Link';
import { useAppContext } from '../../app-context/provider';
import { createClient } from '@crystallize/js-api-client';
import { ProductSlim } from '~/use-cases/contracts/Product';
import { KlevuFetch, KlevuFetchResponse, search } from '@klevu/core';
export const SearchBar = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [show, setShow] = useState(true);
    const [searchResult, setSearchResult] = useState<KlevuFetchResponse | undefined>(undefined);
    const { state: appContextState, path, _t } = useAppContext();
    //const apiClient = createClient({ tenantIdentifier: appContextState.crystallize.tenantIdentifier });
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
        if (value.length > 2) {
            const result = await KlevuFetch(search(value));
            setSearchResult(result);
            setShow(true);
        } else {
            setSearchResult(undefined);
            setShow(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.code == 'Enter') {
            window.location.replace(path(`/search?q=${searchTerm}`));
        }
    };

    const urlToPath = (url: string) => {
        return "/" + url.split("/").slice(4).join("/")
    }

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
            {searchResult && show ? (
                <div
                    ref={ref}
                    className="absolute rounded-xl bg-[#fff] -top-5 w-full pt-20 pb-2 border border-[#dfdfdf] left-0 overflow-y-scroll shadow-sm z-20"
                >
                    <div className="max-h-[400px] overflow-y-scroll">
                        {searchResult.queriesById('search')?.records.map((s, index) => (
                            <div key={index}>
                                <Link
                                    to={path(urlToPath(s.url))}
                                    onClick={() => {
                                        searchResult.queriesById('search')?.getSearchClickSendEvent?.()(
                                            s.id,
                                            s.itemGroupId,
                                        );
                                    }}
                                    prefetch="intent"
                                >
                                    <div className="py-1 px-4 bg-[#fff] flex gap-2 items-center hover:bg-grey2">
                                        <div className="w-[25px] h-[35px] img-container rounded-sm img-cover border border-[#dfdfdf]">
                                            <img src={s.image} />
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-sm ">{s.name}</span>
                                            <span className="text-sm font-bold">{s.salePrice}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
