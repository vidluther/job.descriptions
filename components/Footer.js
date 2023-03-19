import Link from 'next/link';

const version = process.env.NEXT_PUBLIC_APP_VERSION;
const gpt_model = process.env.NEXT_PUBLIC_GPT_MODEL;
console.log(gpt_model)
export default function Footer() {
  return (
    <footer className="py-4">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm text-center">
          Hacked together by {' '}
          <Link className="text-gray-700 hover:text-gray-900" href="https://luther.io">
            Vid Luther
          </Link> { ' '} in 2023  <br />
          powered by OpenAI Chat model {gpt_model + ' '} <br />

          <Link href="https://plausible.io/jd.luther.io?goal=Looked+Up"> Checkout what people are looking for .. </Link> <br />

        </p> <br />
        <p className="text-gray-500 text-sm text-center"> Build info {version} </p>
      </div>
    </footer>
  );
}