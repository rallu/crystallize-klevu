import { KlevuConfig } from '@klevu/core';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

KlevuConfig.init({
    url: "https://eucs31v2.ksearchnet.com/cs/v2/search",
    apiKey: "klevu-167354475363515954",
})

function hydrate() {
    startTransition(() => {
        hydrateRoot(
            document,
            <StrictMode>
                <RemixBrowser />
            </StrictMode>,
        );
    });
}

if (window.requestIdleCallback) {
    window.requestIdleCallback(hydrate);
} else {
    // Safari doesn't support requestIdleCallback
    // https://caniuse.com/requestidlecallback
    window.setTimeout(hydrate, 1);
}
