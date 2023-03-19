import '@/styles/globals.css'
import PlausibleProvider from 'next-plausible'


export default function App({ Component, pageProps }) {
  return (
  <PlausibleProvider
    domain="jd.luther.io"
    trackLocalhost="true"
    enabled="true">
    <Component {...pageProps} />
  </PlausibleProvider>
  )
}
