import Head from 'next/head'
import { useState,useEffect } from "react";

import { Inter } from "next/font/google"

import Footer from 'components/Footer';

import { BeakerIcon } from '@heroicons/react/24/solid'
import { usePlausible } from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })
const jobTitles = ['Software engineer', 'Aircraft Mechanic', 'Cosmetologist', "Mechanic", "Zookeeper", "Cashier"];

function formatResponse(response) {
  const parts = response.split('\n\n');
  const description = parts[0];
  const tasks = parts[1].split('\n').slice(1, -1);
  const salary = parts[2]
  //console.log(parts)
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-lg leading-7 mb-4">{description}</p>
      <ul className="list-disc list-inside mb-8">
        {tasks.map((task, index) => (
          <li className="mb-2" key={index}>
            {task}
          </li>
        ))}
      </ul>
      <p className="text-lg leading-7 mb-4"><strong> Compensation Info</strong> {salary}</p>
    </div>
  );
}

export default function Home() {
  const plausible = usePlausible()
  const [jobTitleIndex, setJobTitleIndex] = useState(0);
  const [jobName, setjobName] = useState("");
  const [result, setResult] = useState();

  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setJobTitleIndex((jobTitleIndex + 1) % jobTitles.length);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobTitleIndex]);


  async function onSubmit(event) {
    event.preventDefault();

    setIsProcessing(true);

    console.log(`Looking up ${jobName}...`);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job: jobName }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setjobName("");
      setIsProcessing(false);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }

  }
  return (
    <>
      <Head>
        <title>OpenAI Job Descriptions</title>
        <meta name="description" content="A simple job description generator using OpenAI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="px-4 py-5 sm:p-6">
        <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          Find out what a{' '}
          <span className="inline-block">
            {jobTitles.map((title, index) => (
              <span key={title} className={index === jobTitleIndex ? '' : 'hidden'}>
                {title}
              </span>
            ))}
          </span>{' '}
          does
        </h1>
      </header>
        </div>
        <div className="px-8 py-10 sm:p-6">
            <form onSubmit={onSubmit}>
            <div className="w-full sm:max-w-xs">
                <input
                  type="text"
                  name="jobName"
                  className="py-2 px-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:ring-blue-400"
                  placeholder="Enter name of the job"
                  value={jobName}
                  onChange={(e) => setjobName(e.target.value)}
                />
                <button
                  onClick={() =>
                    plausible('Looked Up', {
                      props: { job: jobName },
                    })}
                  type="submit"
                  value="Look up..."
                  className="ml-3 inline-flex items-center rounded-md border border-transparent
                  bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  ${isProcessing ? 'opacity-50 cursor-wait' : ''}"
                  disabled={isProcessing}>
        {isProcessing ? 'Looking up...' : 'Look up...'}
                  </button>
            </div>
          </form>
          </div>
          <BeakerIcon className="h-6 w-6 text-red-500"/>
        <div> {result ? formatResponse(result) : 'please enter a job title above'}  </div>
        <Footer />

        </div>

    </>
  )
}
