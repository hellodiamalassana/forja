import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck } from 'react-icons/fi';

function CodeEditor({ code, language = 'javascript', filename }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
        <span className="text-sm text-gray-400 font-mono">{filename}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 text-gray-400 hover:text-primary-500 transition-colors"
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4" />
              <span className="text-xs">Copié!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4" />
              <span className="text-xs">Copier</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeEditor;
