import { useState } from 'react';
import filterIcon from '~/assets/filterIcon.svg';
import { useAppContext } from '../../app-context/provider';
import { FilterManager, KlevuFilterResultOptions } from '@klevu/core';

export const KlevuAttributeFilter: React.FC<{ manager: FilterManager }> = ({ manager }) => {
    const [show, setShow] = useState(false);
    const { _t } = useAppContext();

    const allOptions: KlevuFilterResultOptions[] = manager.options
    return (
        <>
            {Object.keys(allOptions).length > 0 && (
                <div>
                    <div
                        className="relative flex justify-between items-center w-60 bg-grey py-2 px-6 rounded-md hover:cursor-pointer"
                        onClick={() => setShow(!show)}
                    >
                        <p className="text-md font-bold">{_t('search.filterByAttributes')}</p>
                        <img src={filterIcon} alt="" />
                    </div>
                    {show && (
                        <div className="absolute w-60 z-50">
                            {allOptions.map((optionGroup) => (
                                <div key={optionGroup.key} className="bg-grey px-5 py-2 border-bottom-2">
                                    <p className="font-semibold">{optionGroup.label}</p>
                                    {optionGroup.options.map((option, index: number) => (
                                        <div key={index} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                value={option.value}
                                                id={option.name}
                                                name="attr"
                                                defaultChecked={option.selected}
                                                onChange={() => {
                                                    manager.toggleOption(optionGroup.key, option.name)
                                                }}
                                            />
                                            <label htmlFor={option.name}>{option.name} ({option.count})</label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
