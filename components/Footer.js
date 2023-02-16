import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="py-4">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm text-center">
          Copyright{' '}
          <Link className="text-gray-700 hover:text-gray-900" href="https://luther.io">
            Vid Luther
          </Link>{' '}
          2023
        </p>
      </div>
    </footer>
  );
}