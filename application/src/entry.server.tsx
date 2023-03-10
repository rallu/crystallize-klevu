import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { KlevuConfig } from '@klevu/core';

KlevuConfig.init({
    url: "https://eucs31v2.ksearchnet.com/cs/v2/search",
    apiKey: "klevu-167354475363515954",
})

const ABORT_DELAY = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
    return isbot(request.headers.get('user-agent'))
        ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
        : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
            onAllReady() {
                const body = new PassThrough();

                responseHeaders.set('Content-Type', 'text/html');
                let http2PushLinksHeaders = remixContext.matches
                    .flatMap(({ route: { module, imports } }) => [module, ...(imports || [])])
                    .filter(Boolean)
                    .concat([
                        remixContext.manifest.url,
                        remixContext.manifest.entry.module,
                        ...remixContext.manifest.entry.imports,
                    ]);

                responseHeaders.set(
                    'Link',
                    (responseHeaders.has('Link') ? responseHeaders.get('Link') + ',' : '') +
                        http2PushLinksHeaders
                            .map((link: string) => `<${link}>; rel=preload; as=script; crossorigin=anonymous`)
                            .join(','),
                );

                resolve(
                    new Response(body, {
                        headers: responseHeaders,
                        status: didError ? 500 : responseStatusCode,
                    }),
                );

                pipe(body);
            },
            onShellError(error: unknown) {
                reject(error);
            },
            onError(error: unknown) {
                didError = true;

                console.error(error);
            },
        });

        setTimeout(abort, ABORT_DELAY);
    });
}

function handleBrowserRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
            onShellReady() {
                const body = new PassThrough();

                responseHeaders.set('Content-Type', 'text/html');

                resolve(
                    new Response(body, {
                        headers: responseHeaders,
                        status: didError ? 500 : responseStatusCode,
                    }),
                );

                pipe(body);
            },
            onShellError(err: unknown) {
                reject(err);
            },
            onError(error: unknown) {
                didError = true;

                console.error(error);
            },
        });

        setTimeout(abort, ABORT_DELAY);
    });
}
