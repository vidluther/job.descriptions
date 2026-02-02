import Head from "next/head";
import { useState, useEffect, useRef } from "react";

import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

import Footer from "components/Footer";
import ApiResponse from "components/apiResponse";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const jobTitles = [
  "Nurse Practitioner",
  "Software Engineer",
  "Aircraft Mechanic",
  "Cosmetologist",
  "Epic Analyst",
  "Zookeeper",
  "Cashier",
  "Dental Hygienist",
  "Medical Assistant",
  "Pharmacy Technician",
  "Physical Therapist",
  "Radiologic Technologist",
  "Registered Nurse",
];

const suggestedJobs = [
  "Firefighter",
  "Data Scientist",
  "Chef",
  "Pilot",
  "Veterinarian",
  "Architect",
];

export default function Home() {
  const [jobTitleIndex, setJobTitleIndex] = useState(0);
  const [jobName, setjobName] = useState("");
  const [apiResponseContent, setApiResponseContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setJobTitleIndex((prevIndex) => (prevIndex + 1) % jobTitles.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (apiResponseContent && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiResponseContent]);

  async function submitJob(title) {
    setIsProcessing(true);
    setErrorMessage("");
    setApiResponseContent("");
    setHasSearched(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: title }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setApiResponseContent(data.result);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!jobName.trim()) return;
    submitJob(jobName);
  }

  function handleSuggestionClick(title) {
    setjobName(title);
    submitJob(title);
  }

  function resetSearch() {
    setjobName("");
    setApiResponseContent("");
    setErrorMessage("");
    setHasSearched(false);
  }

  return (
    <>
      <Head>
        <title>What Does a... — Job Description Explorer</title>
        <meta
          name="description"
          content="Curious what people actually do at work? Enter any job title and discover daily responsibilities, skills needed, and who thrives in the role."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-cream ${plusJakarta.className}`}>
        {/* Minimal header */}
        <header className="relative z-10 px-6 py-5">
          <nav className="mx-auto max-w-5xl flex items-center justify-between">
            <button
              onClick={resetSearch}
              className="text-sm tracking-widest uppercase text-muted font-medium hover:text-charcoal transition-colors duration-200"
            >
              jd.luther.io
            </button>
            {hasSearched && (
              <button
                onClick={resetSearch}
                className="text-sm text-amber-accent hover:text-charcoal transition-colors duration-200"
              >
                &larr; New search
              </button>
            )}
          </nav>
        </header>

        {/* Hero */}
        <main className="relative">
          <section
            className={`hero-glow px-6 ${hasSearched && apiResponseContent ? "pt-8 pb-12" : "pt-16 sm:pt-24 pb-20"} transition-all duration-700`}
          >
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              {/* Headline */}
              <h1
                className={`${instrumentSerif.className} text-charcoal leading-[1.1] mb-2`}
              >
                <span
                  className={`block text-lg sm:text-xl text-muted font-normal mb-4 ${plusJakarta.className} tracking-wide`}
                >
                  Ever wonder what a
                </span>
                <span className="block relative">
                  <span className="relative inline-block min-w-[280px] sm:min-w-[400px] text-4xl sm:text-6xl md:text-7xl">
                    {jobTitles.map((title, index) => (
                      <span
                        key={title}
                        className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                        style={{
                          opacity: index === jobTitleIndex ? 1 : 0,
                          transform: `translateY(${
                            index === jobTitleIndex
                              ? 0
                              : index ===
                                  (jobTitleIndex -
                                    1 +
                                    jobTitles.length) %
                                    jobTitles.length
                                ? -20
                                : 20
                          }px)`,
                          color: "#D4943A",
                        }}
                      >
                        {title}
                      </span>
                    ))}
                    {/* Invisible spacer for height */}
                    <span className="invisible" aria-hidden="true">
                      {jobTitles.reduce((a, b) =>
                        a.length > b.length ? a : b,
                      )}
                    </span>
                  </span>
                </span>
                <span
                  className={`block text-lg sm:text-xl text-muted font-normal mt-4 ${plusJakarta.className} tracking-wide`}
                >
                  actually does all day?
                </span>
              </h1>

              {/* Search input */}
              <form
                onSubmit={onSubmit}
                className="mt-12 sm:mt-16 max-w-xl mx-auto"
              >
                <div className="relative">
                  <input
                    type="text"
                    name="jobName"
                    className="w-full text-lg sm:text-xl px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-charcoal placeholder:text-gray-300 focus:outline-none focus:border-amber-accent focus:ring-4 focus:ring-amber-glow transition-all duration-300"
                    placeholder="Type any job title..."
                    value={jobName}
                    onChange={(e) => setjobName(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !jobName.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-charcoal text-cream rounded-xl text-sm font-medium hover:bg-deep disabled:opacity-30 disabled:hover:bg-charcoal transition-all duration-200"
                  >
                    {isProcessing ? "Thinking..." : "Discover \u2192"}
                  </button>
                </div>
              </form>

              {/* Suggestion chips */}
              {!hasSearched && (
                <div className="mt-8 animate-fade-in">
                  <p className="text-xs uppercase tracking-widest text-muted mb-3">
                    Try one
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedJobs.map((title) => (
                      <button
                        key={title}
                        onClick={() => handleSuggestionClick(title)}
                        className="px-4 py-1.5 text-sm rounded-full border border-gray-200 text-muted hover:border-amber-accent hover:text-amber-accent hover:bg-amber-glow transition-all duration-200"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex justify-center py-16 animate-fade-in">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-accent loading-dot" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-accent loading-dot" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-accent loading-dot" />
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mx-auto max-w-2xl px-6 animate-fade-in-up">
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-5 text-sm">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Results */}
          {apiResponseContent && (
            <section ref={resultRef} className="animate-fade-in-up">
              <div className="mx-auto max-w-2xl px-6 pb-24">
                <div className="border-t border-gray-200 pt-10">
                  <p className="text-xs uppercase tracking-widest text-muted mb-6">
                    About: {jobName}
                  </p>
                  <ApiResponse content={apiResponseContent} />
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
