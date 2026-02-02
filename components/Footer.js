import Link from 'next/link';

const version = process.env.NEXT_PUBLIC_APP_VERSION;
const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
const aiModel = process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-3-flash-preview';

export default function Footer() {
  return (
    <footer className="py-4">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm text-center">
          Hacked together by{' '}
          <Link className="text-gray-700 hover:text-gray-900" href="https://luther.io">
            Vid Luther
          </Link>{' '} in 2023  <br />
          powered by {aiProvider} model {aiModel}
        </p>
        <p className="text-gray-500 text-sm text-center"> build info: {version} </p>
        <br />
        <div className="text-blue-500 text-sm text-center">
          <Link href="https://plausible.io/jd.luther.io?goal=Looked+Up"> Curious what other people searched for? .. </Link>
        </div>
      </div>
    </footer>
  );
}
