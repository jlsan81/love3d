import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo-love3d-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-love3d-mark.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
