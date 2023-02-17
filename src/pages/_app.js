import '@/styles/globals.css'
import PlausibleProvider from 'next-plausible'


export default function App({ Component, pageProps }) {
  return (
  <PlausibleProvider
    domain="job-descriptions.vercel.app"
    trackLocalhost="true"
    enabled="true">
    <Component {...pageProps} />
  </PlausibleProvider>
  )
}
