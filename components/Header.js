import { useState, useEffect } from "react";

const defaultJobTitles = [
  "Nurse Practioner",
  "Software engineer",
  "Aircraft Mechanic",
  "Cosmetologist",
  "Epic Analyst",
  "Zookeeper",
  "Cashier",
  "Dental Hygienist",
  "Dental Assistant",
  "Medical Assistant",
  "Pharmacy Technician",
  "Physical Therapist",
  "Radiologic Technologist",
  "Registered Nurse",
];

export default function Header({ jobTitles = defaultJobTitles }) {
  const [jobTitleIndex, setJobTitleIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setJobTitleIndex((prevIndex) => (prevIndex + 1) % jobTitles.length);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobTitles.length]);

  return (
    <header className="bg-white py-6 h-50">
      <h1 className="text-2xl text-center font-bold">
        Ever wonder what a <br />
        <span className="inline-block">
          {jobTitles.map((title, index) => (
            <span
              key={title}
              className={index === jobTitleIndex ? "" : "hidden"}
            >
              {title}
            </span>
          ))}
        </span>{" "}
        does?
      </h1>
    </header>
  );
}
