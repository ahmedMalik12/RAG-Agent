'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();


  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 10;

    messages.forEach(m => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${m.role}:`, 10, yPos);
      yPos += 10;

      m.parts.forEach(part => {
        doc.setFont('helvetica', 'normal');
        switch (part.type) {
          case 'text':
            const lines = doc.splitTextToSize(part.text, 180);
            doc.text(lines, 10, yPos);
            yPos += lines.length * 10;
            break;
          case 'tool-addResource':
          case 'tool-getInformation':
            doc.text(`called tool: ${part.type}`, 10, yPos);
            yPos += 10;
            const jsonStr = JSON.stringify(part.input, null, 2);
            const jsonLines = doc.splitTextToSize(jsonStr, 180);
            doc.text(jsonLines, 10, yPos);
            yPos += jsonLines.length * 10;
            break;
        }
      });

      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 10;
      }
    });

    doc.save('chat-conversation.pdf');
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              {m.parts.map(part => {
                switch (part.type) {
                  case 'text':
                    return <p>{part.text}</p>;
                  case 'tool-addResource':
                  case 'tool-getInformation':
                    return (
                      <p>
                        call{part.state === 'output-available' ? 'ed' : 'ing'}{' '}
                        tool: {part.type}
                        <pre className="my-4 bg-zinc-100 p-2 rounded-sm">
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      </p>
                    );
                }
              })}
            </div>
          </div>
        ))}
      </div>

            <button
        onClick={downloadPDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download PDF
      </button>

      <form
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}