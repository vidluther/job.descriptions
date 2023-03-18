import React from 'react';

function formatContent(content) {
  const sections = content.split(/\n{2}(?=\d+\. )/);
  return sections.map((section) => section.trim());
}



const ApiResponse = ({ content }) => {
  if(!content) return "please enter a job title above"
  console.log("going to format" + content)
  //console.log("job name is " + jobName)
  const sections = formatContent(content);

  return (
    <div className="text-base text-gray-800 mb-8">
      {sections.map((section, index) => {
        const [title, ...rest] = section.split(/\n/);
        const content = rest.join('\n');
        return (
          <div key={index}>
            <h3 className="text-2xl font-bold mt-8 mb-4">{title} </h3>
            <p
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ApiResponse;
