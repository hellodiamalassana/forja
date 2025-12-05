import { FiUser, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-dark-700 text-gray-300'
          : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
      }`}>
        {isUser ? <FiUser className="w-5 h-5" /> : <FiCpu className="w-5 h-5" />}
      </div>

      {/* Message */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[80%] ${
          isUser
            ? 'bg-primary-500/20 border border-primary-500/30'
            : 'bg-dark-700/50 border border-dark-600'
        } rounded-2xl px-5 py-3`}>
          <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
