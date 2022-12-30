import { FilterManager } from '@klevu/core';
import { Form, useLocation, useNavigate, useSubmit, useTransition } from '@remix-run/react';
import React, { useRef } from 'react';
import { useAppContext } from '../../app-context/provider';
import { KlevuAttributeFilter } from './klevu-attribute-filter';
import { KlevuPriceRangeFilter } from './klevu-price-range-filter';
import { PriceRangeFilter } from './price-range-filter';

export const KlevuFilter: React.FC<{ manager: FilterManager }> = ({ manager }) => {
    const location = useLocation();
    const formRef = useRef(null);
    const { _t } = useAppContext();

    function handleChange(event: any) {
        //submit(event.currentTarget, { replace: true });
    }

    return (
        <div className="flex gap-5 mb-10 flex-wrap items-center justify-start">
            <Form
                method="get"
                action={location.pathname}
                onChange={handleChange}
                ref={formRef}
                className="flex gap-4 flex-wrap"
            >
                {manager.sliders[0] ? (
                    <KlevuPriceRangeFilter
                        min={parseFloat(manager.sliders[0].min)}
                        max={parseFloat(manager.sliders[0].max)}
                        onChange={(min, max) => manager.updateSlide(manager.sliders[0].key, min, max)}
                    />
                ) : null}
                <KlevuAttributeFilter manager={manager} />
            </Form>

            <button onClick={() => manager.clearOptionSelections()}>{_t('search.removeAllFilters')}</button>
        </div>
    );
};
