import Head from 'next/head'
import { useState,useEffect } from "react";
import Image from 'next/image'
import { Inter } from '@next/font/google'
//import styles from '@/styles/Home.module.css'
import Footer from 'components/Footer';

import { BeakerIcon } from '@heroicons/react/24/solid'
import { usePlausible } from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })
const jobTitles = ['Software engineer', 'Aircraft Mechanic', 'Cosmetologist', "Mechanic", "Zookeeper", "Cashier"];

export default function Home() {
  const plausible = usePlausible()
  const [jobTitleIndex, setJobTitleIndex] = useState(0);
  const [jobName, setjobName] = useState("");
  const [result, setResult] = useState();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setJobTitleIndex((jobTitleIndex + 1) % jobTitles.length);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobTitleIndex]);


  async function onSubmit(event) {
    console.log(`Looking up ${jobName}...`);
    event.preventDefault();
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
        <div className="px-4 py-5 sm:p-6">
            <form onSubmit={onSubmit}>
            <div className="w-full sm:max-w-xs">
                <input
                  type="text"
                  name="jobName"
                  className="py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:ring-blue-400"
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
                  value="Tell Me more...."
                  className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                  Look up..
                  </button>
            </div>
          </form>
          </div>
          <BeakerIcon className="h-6 w-6 text-red-500"/>
        <code> {result} </code>
        <Footer />

        </div>

    </>
  )
}
