// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <script
                        id="googleMapsScript"
                        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
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