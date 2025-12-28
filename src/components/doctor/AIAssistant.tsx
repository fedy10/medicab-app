import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Loader, User, Bot, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  doctorId: string;
  patientContext?: {
    name: string;
    age: number;
    diseases: string[];
    lastConsultation?: string;
  };
}

export function AIAssistant({ doctorId, patientContext }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger l'historique des conversations depuis le localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`ai-chat-${doctorId}`);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, [doctorId]);

  // Sauvegarder les conversations
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`ai-chat-${doctorId}`, JSON.stringify(messages));
    }
  }, [messages, doctorId]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamOllamaResponse = async (
    userPrompt: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: Error) => void
  ) => {
    try {
      // Construire le message système avec contexte patient
      let systemMessage = `Tu es Meditron, un assistant médical IA expert. Réponds de manière professionnelle, concise et précise aux questions médicales.`;
      
      if (patientContext) {
        systemMessage += `\n\nContexte du patient actuel:\n- Nom: ${patientContext.name}\n- Âge: ${patientContext.age} ans\n- Pathologies connues: ${patientContext.diseases.length > 0 ? patientContext.diseases.join(', ') : 'Aucune'}`;
        if (patientContext.lastConsultation) {
          systemMessage += `\n- Dernière consultation: ${patientContext.lastConsultation}`;
        }
      }

      // Utiliser l'API /api/chat qui gère mieux les conversations
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meditron',
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          stream: true,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            top_k: 40,
            num_predict: 512,
            num_ctx: 2048,
            repeat_penalty: 1.1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'appel à Ollama');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('Impossible de lire la réponse');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            // Pour /api/chat, la réponse est dans json.message.content
            if (json.message && json.message.content) {
              fullResponse += json.message.content;
              onChunk(json.message.content);
            }
            if (json.done) {
              onComplete(fullResponse);
              return;
            }
          } catch (e) {
            // Ignorer les lignes mal formées
          }
        }
      }

      onComplete(fullResponse);
    } catch (error) {
      console.error('Erreur Ollama:', error);
      onError(error as Error);
    }
  };

  const getFallbackResponse = (prompt: string): string => {
    const fallbackResponses: { [key: string]: string } = {
      'examens': `Pour un patient de ${patientContext?.age || 'cet'} ans, je recommande:
- Bilan sanguin complet (NFS, ionogramme, fonction rénale et hépatique)
- Glycémie à jeun
- Bilan lipidique
- ECG si >40 ans
- Tension artérielle

Ces examens permettront une évaluation de base complète.`,
      
      'hypertension': `Pour la prise en charge de l'hypertension:
- Modifications du mode de vie (régime pauvre en sel, exercice)
- IEC ou ARA2 en première intention
- Surveillance régulière de la tension
- Bilan rénal et électrolytique
- Fond d'œil si HTA sévère`,
      
      'diabète': `Pour la gestion du diabète type 2:
- Metformine en première intention
- Surveillance HbA1c tous les 3 mois
- Contrôle glycémique quotidien
- Éducation thérapeutique
- Bilan lipidique et rénal régulier`,
      
      'ordonnance': `Proposition d'ordonnance type:
1. Paracétamol 1g - 3 fois/jour pendant 5 jours (si douleur/fièvre)
2. Ibuprofène 400mg - si douleurs intenses (avec protection gastrique)
3. Repos et hydratation

⚠️ À adapter selon le diagnostic spécifique du patient.`,
    };

    const lowerPrompt = prompt.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerPrompt.includes(key)) {
        return `${response}\n\n⚠️ Note: Cette réponse est générée localement. Pour des réponses plus précises, assurez-vous qu'Ollama est en cours d'exécution avec le modèle Meditron.`;
      }
    }

    return `Je suis désolé, je ne peux pas me connecter au serveur Ollama en ce moment. 

Pour utiliser l'assistant IA avec le modèle Meditron:
1. Installez Ollama: https://ollama.ai
2. Téléchargez le modèle Meditron: \`ollama pull meditron\`
3. Démarrez le serveur: \`ollama serve\`

En attendant, je peux vous aider avec des conseils médicaux de base. Que souhaitez-vous savoir?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Créer un message assistant vide pour le streaming
    const assistantMessageIndex = messages.length + 1;
    let streamedContent = '';

    const tempAssistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempAssistantMessage]);

    streamOllamaResponse(
      currentInput,
      // onChunk: mise à jour progressive du message
      (chunk) => {
        streamedContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            ...newMessages[assistantMessageIndex],
            content: streamedContent,
          };
          return newMessages;
        });
      },
      // onComplete: finaliser le message
      (fullResponse) => {
        setIsLoading(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            ...newMessages[assistantMessageIndex],
            content: fullResponse,
          };
          return newMessages;
        });
      },
      // onError: afficher un message de secours
      (error) => {
        setIsLoading(false);
        const fallbackResponse = getFallbackResponse(currentInput);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            ...newMessages[assistantMessageIndex],
            content: fallbackResponse,
          };
          return newMessages;
        });
      }
    );
  };

  const handleClearChat = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
      setMessages([]);
      localStorage.removeItem(`ai-chat-${doctorId}`);
    }
  };

  const suggestions = [
    'Examens pour nouveau patient',
    'Aide au diagnostic',
    'Générer une ordonnance',
    'Résumer le dossier patient',
    'Interactions médicamenteuses',
    'Posologie recommandée',
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-gray-900">Assistant Médical IA</h4>
            <p className="text-xs text-gray-600">Propulsé par Meditron</p>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Effacer l'historique"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h5 className="text-gray-900 mb-2">Bienvenue sur l'assistant IA</h5>
            <p className="text-sm text-gray-600 mb-4">Posez vos questions médicales</p>
            
            {patientContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm">
                <p className="text-gray-700">
                  <strong>Patient actuel:</strong> {patientContext.name}, {patientContext.age} ans
                </p>
                {patientContext.diseases.length > 0 && (
                  <p className="text-gray-600 mt-1">
                    Maladies: {patientContext.diseases.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border-2 border-purple-200 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-purple-500 animate-spin" />
                <span className="text-sm text-gray-600">Analyse en cours...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-600 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 text-xs transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-purple-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
            placeholder="Posez votre question médicale..."
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
