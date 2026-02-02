import Head from 'next/head'
import { useState,useEffect } from "react";

import { Inter } from "next/font/google"

import Footer from 'components/Footer';
import ApiResponse from 'components/apiResponse';


import { BeakerIcon } from '@heroicons/react/24/solid'
import { usePlausible } from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })
const jobTitles = [
  'Nurse Practioner',
  'Software engineer',
  'Aircraft Mechanic',
  'Cosmetologist',
  'Epic Analyst',
  'Zookeeper',
  'Cashier',
  'Dental Hygienist',
  'Dental Assistant',
  'Medical Assistant',
  'Pharmacy Technician',
  'Physical Therapist',
  'Radiologic Technologist',
  'Registered Nurse',

];

function oldformatResponse(response) {
  const parts = response.split('\n\n');
  const description = parts[0];
  const tasks = parts[1].split('\n').slice(1, -1).map(task => task.replace(/-/g, ''));
  const salary = parts[2]
  console.log(parts)
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-lg leading-7 mb-4">{description}</p>
      <ul className="list-decimal list-inside mb-8">
        {tasks.map((task, index) => (
          <li className="mb-2 ml-4 list-item" key={index}>
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
  const [apiResponseContent, setApiResponseContent] = useState('');
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


    try {
      const response = await fetch("/api/ai", {
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
      setApiResponseContent(data.result);

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
        <title>Job Descriptions</title>
        <meta name="description" content="Find out what someone with a job title does.." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white py-6 h-50">
          <h1 className="text-2xl text-center font-bold">
          Ever wonder what a{' '} <br />
          <span className="inline-block">
            {jobTitles.map((title, index) => (
              <span key={title} className={index === jobTitleIndex ? '' : 'hidden'}>
                {title}
              </span>
            ))}
          </span>{' '}
          does?
        </h1>
      </header>

      <main className="flex flex-col items-center pt-12">
        <div className="w-full sm:w-2/3 md:w-1/2 flex flex-col items-center">
            <form onSubmit={onSubmit}>
                <input
                  type="text"
                  name="jobName"
                  className="border-2 border-gray-300 rounded-lg w-full sm:w-2/3 md:w-1/2 p-2 mb-4"
                  placeholder="Enter a job title..."
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-8"
                >
                  {isProcessing ? 'Looking up...' : 'Look it up...'}
                </button>
            </form>
        </div>
          <BeakerIcon className="h-6 w-6 text-red-500"/>

          <div className="w-full sm:w-2/3 md:w-1/2">
            <ApiResponse content={apiResponseContent} />
          </div>
        </main>
        <Footer />


      </div>
    </>
  )
}
