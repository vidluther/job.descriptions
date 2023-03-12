import Link from 'next/link';

const version = process.env.npm_package_version;

export default function Footer() {
  return (
    <footer className="py-4">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm text-center">
          Hacked together by {' '}
          <Link className="text-gray-700 hover:text-gray-900" href="https://luther.io">
            Vid Luther
          </Link>{' '}
          in 2023. <br />
          <Link href="https://plausible.io/job-descriptions.vercel.app?goal=Looked+Up"> Checkout what people are looking for .. </Link> <br />

        </p>
      </div>
    </footer>
  );
}