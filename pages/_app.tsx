import type { AppProps } from 'next/app';
import Script from 'next/script';
import { createGlobalStyle } from 'styled-components';

const GA_ID = 'UA-103585814-1';

// Replaces the tachyons stylesheet, which was loaded for its reset alone --
// nothing here ever used a tachyons class.
const GlobalStyle = createGlobalStyle`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        min-height: 100vh;
        background: linear-gradient(to right, #ffd194, #397cd0);
    }
`;

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <GlobalStyle />
            <Component {...pageProps} />

            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `}
            </Script>
        </>
    );
}
