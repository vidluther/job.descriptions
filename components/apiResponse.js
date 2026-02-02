import React from "react";
import ReactMarkdown from "react-markdown";

const ApiResponse = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-lg max-w-none prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-charcoal prose-ul:my-4 prose-li:my-1">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default ApiResponse;
