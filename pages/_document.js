import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import styled from 'styled-components';

export default class MyDocument extends Document {
    static getInitialProps ({ renderPage }) {
        // styled-components in nextjs -- https://jsramblings.com/2017/11/27/using-styled-components-with-next-js.html
        const sheet = new ServerStyleSheet()
        const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
        const styleTags = sheet.getStyleElement()
        return { ...page, styleTags }
    }

    render () {
        return (
            <html>
                <Head>
                {this.props.styleTags}
                </Head>
                <body style={bodyStyle}>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}

const bodyStyle = {
    background: '#397cd0',  /* fallback for old browsers */
	background: '-webkit-linear-gradient(to right, #ffd194, #397cd0)',  /* Chrome 10-25, Safari 5.1-6 */
	background: 'linear-gradient(to right, #ffd194, #397cd0)', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
