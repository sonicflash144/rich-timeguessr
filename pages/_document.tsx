// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <script
                        id="googleMapsScript"
                        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCfmH3oCUFCC8GAtgy1VoGeajs4Ed1gEEo"
                        async
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;