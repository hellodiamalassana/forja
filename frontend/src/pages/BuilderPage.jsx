import { useState, useRef, useEffect } from 'react';
import { FiSend, FiDownload, FiCode, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ChatMessage from '../components/ChatMessage';
import CodeEditor from '../components/CodeEditor';
import useProjectStore from '../store/useProjectStore';
import { forjaAPI } from '../services/api';

function BuilderPage() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['windows']);
  const messagesEndRef = useRef(null);

  const {
    currentSession,
    currentProject,
    conversationHistory,
    isGenerating,
    isBuilding,
    setCurrentSession,
    addMessage,
    setCurrentProject,
    setGenerating,
    setBuilding,
  } = useProjectStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setGenerating(true);

    try {
      let response;

      if (!currentSession) {
        // Generate new project
        response = await forjaAPI.generate(userMessage);
        setCurrentSession(response.sessionId);
        toast.success('Application générée !');
      } else {
        // Modify existing project
        response = await forjaAPI.modify(
          currentSession,
          userMessage,
          currentProject
        );
        toast.success('Modifications appliquées !');
      }

      addMessage('assistant', response.aiResponse);
      setCurrentProject(response.code);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.error || 'Erreur de génération');
      addMessage(
        'assistant',
        'Désolé, une erreur s\'est produite. Veuillez réessayer.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleBuild = async () => {
    if (!currentSession || selectedPlatforms.length === 0) {
      toast.error('Veuillez sélectionner au moins une plateforme');
      return;
    }

    setBuilding(true);
    toast.loading('Compilation en cours...', { id: 'build' });

    try {
      const result = await forjaAPI.build(currentSession, selectedPlatforms);

      toast.success(`Build terminé en ${result.buildTime}`, { id: 'build' });

      // Show download links
      Object.entries(result.downloads).forEach(([platform, url]) => {
        toast.success(`${platform}: Prêt à télécharger`, {
          duration: 10000,
        });
      });
    } catch (error) {
      console.error('Build error:', error);
      toast.error(error.response?.data?.error || 'Erreur de compilation', {
        id: 'build',
      });
    } finally {
      setBuilding(false);
    }
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold glow-text">Générateur d'Applications</h1>
            <p className="text-sm text-gray-400 mt-1">
              Décrivez votre application, Forja la crée pour vous
            </p>
          </div>

          {currentProject && (
            <button
              onClick={handleBuild}
              disabled={isBuilding}
              className="btn-primary flex items-center space-x-2"
            >
              <FiDownload className="w-4 h-4" />
              <span>{isBuilding ? 'Compilation...' : 'Compiler'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-dark-700 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {conversationHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
                    <span className="text-4xl">⚡</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Commencez à créer
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Décrivez l'application que vous souhaitez créer. Par exemple :
                  </p>
                  <div className="space-y-2 text-left">
                    {[
                      'Une calculatrice avec design moderne',
                      'Une application de gestion de tâches',
                      'Un éditeur de notes markdown',
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(example)}
                        className="w-full text-left px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-xl transition-colors text-sm"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {conversationHistory.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isGenerating && (
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
                    <span className="text-sm">Forja génère votre application...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-dark-700 p-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Décrivez votre application ou modification..."
                className="input flex-1"
                disabled={isGenerating}
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className="btn-primary w-12 h-12 flex items-center justify-center p-0"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview/Code Panel */}
        <div className="w-1/2 flex flex-col bg-dark-900">
          {/* Tabs */}
          <div className="bg-dark-800 border-b border-dark-700 flex items-center px-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'preview'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FiEye className="w-4 h-4" />
              <span>Aperçu</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'code'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FiCode className="w-4 h-4" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'export'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!currentProject ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Générez une application pour voir l'aperçu</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'preview' && (
                  <div className="space-y-4">
                    <div className="card">
                      <h3 className="text-lg font-bold mb-2">Aperçu de l'application</h3>
                      <p className="text-gray-400 text-sm">
                        L'aperçu interactif sera disponible prochainement.
                        Pour l'instant, consultez le code généré.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="space-y-4">
                    {Object.entries(currentProject.files || {}).map(([filename, content]) => (
                      <CodeEditor
                        key={filename}
                        filename={filename}
                        code={content}
                        language={
                          filename.endsWith('.js') ? 'javascript' :
                          filename.endsWith('.html') ? 'html' :
                          filename.endsWith('.css') ? 'css' :
                          filename.endsWith('.json') ? 'json' :
                          'text'
                        }
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'export' && (
                  <div className="space-y-6">
                    <div className="card">
                      <h3 className="text-lg font-bold mb-4">Plateformes d'export</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'windows', name: 'Windows', ext: '.exe' },
                          { id: 'mac', name: 'macOS', ext: '.dmg' },
                          { id: 'linux', name: 'Linux', ext: '.AppImage' },
                        ].map((platform) => (
                          <label
                            key={platform.id}
                            className="flex items-center justify-between p-4 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedPlatforms.includes(platform.id)}
                                onChange={() => togglePlatform(platform.id)}
                                className="w-5 h-5 rounded accent-primary-500"
                              />
                              <div>
                                <div className="font-medium">{platform.name}</div>
                                <div className="text-sm text-gray-400">{platform.ext}</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="card bg-primary-500/10 border-primary-500/30">
                      <h4 className="font-bold mb-2">⚠️ Note importante</h4>
                      <p className="text-sm text-gray-400">
                        La compilation peut prendre 5-10 minutes selon les plateformes sélectionnées.
                        Vous recevrez les liens de téléchargement une fois terminé.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuilderPage;
