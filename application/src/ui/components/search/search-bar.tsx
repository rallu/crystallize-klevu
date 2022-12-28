import { KlevuInit, KlevuQuicksearch } from '@klevu/ui-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useAppContext } from '~/ui/app-context/provider';

export const SearchBar = () => {
    const ref = useRef<HTMLKlevuQuicksearchElement>();
    const { path, _t } = useAppContext();

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        ref.current.addEventListener('klevuSearchClick', (event: any) => {
            if (event.detail.length === 0) {
                return;
            }

            window.location.replace(path('/search?q=' + event.detail));
        });
    }, []);

    return (
        <div className="xl:w-[340px] md:px-4 relative 270px">
            <KlevuInit url="https://eucs23v2.ksearchnet.com/cs/v2/search" apiKey="klevu-160320037354512854">
                <KlevuQuicksearch
                    popupAnchor="bottom-start"
                    placeholder={_t('search.placeholder')}
                    searchText="🔎"
                    ref={ref as any}
                    searchCategories
                />
            </KlevuInit>
        </div>
    );
};
