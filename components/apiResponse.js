import React from "react";
import ReactMarkdown from "react-markdown";

const ApiResponse = ({ content }) => {
  if (!content) return "";

  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default ApiResponse;
