import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { EcologicalRAG, SearchResult, QueryAnalytics, QueryAnalyticsData } from '@/lib/rag/ecological-rag';
import { Loader2, Send, FileText, Clock, Users, MapPin, Microscope, Settings } from 'lucide-react';
import { RAGDemo } from './rag-demo';
import './rag-chat.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  papersFound?: number;
  papersSearched?: number;
  question?: string;
}

interface RAGChatProps {
  className?: string;
}

export function RAGChat({ className }: RAGChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🌊 Welcome to the Lake Kinneret RAG System! I can help you explore ecological research about phytoplankton, zooplankton, nutrients, and ecosystem dynamics in Lake Kinneret.\n\n**How to use:**\n1. Ask your research question\n2. Choose how many papers to search (1-10)\n3. Get an AI-powered research-based answer!\n\n**✅ OpenAI Integration Active** - You\'ll receive comprehensive AI-generated responses that synthesize findings from multiple research papers.\n\n**Example questions:**\n• Does temperature affect zooplankton growth?\n• How do nutrients impact phytoplankton biomass?\n• What causes cyanobacterial blooms?\n• How does climate change affect Lake Kinneret?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [papersToSearch, setPapersToSearch] = useState([3]);
  const [ragSystem] = useState(() => new EcologicalRAG());
  const [analytics] = useState(() => new QueryAnalytics());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only auto-scroll if there are new messages (not on initial load)
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const exampleQuestions = [
    'Does the concentration of nutrients (nitrogen/phosphorus) affect the biomass of phytoplankton?',
    'Does the temperature of the water column affect the growth rate of zooplankton?',
    'Is there a relationship between solar radiation intensity and the frequency of cyanobacterial blooms?',
    'Do different seasons (winter/summer) differ in their levels of dissolved oxygen?',
    'How does climate change affect the frequency and intensity of algal blooms in Lake Kinneret?'
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      question: input.trim(),
      papersSearched: papersToSearch[0]
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const startTime = Date.now();
      
      // OpenAI integration is already active with built-in API key
      
      const result: SearchResult = await ragSystem.query(currentInput, papersToSearch[0]);
      const responseTime = Date.now() - startTime;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date(),
        papersFound: result.papers_found,
        papersSearched: papersToSearch[0],
        question: currentInput
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log analytics
      analytics.logQuery(currentInput, responseTime, result.papers_found, result.response.length);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting with better line breaks
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/🔍|📊|👥|📖|🐟|📍|🔬|🔗|📋|🌊|❌|✅/g, (match) => `<span class="inline-block mr-1">${match}</span>`);
  };

  const systemStats = analytics.getAnalytics();

  return (
    <div className={`rag-chat-container space-y-4 ${className}`}>
      {/* Demo Instructions */}
      <RAGDemo />
      
      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            RAG System Status
          </CardTitle>
          <CardDescription>
            Lake Kinneret Ecological Research Assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{ragSystem.getPaperCount()}</div>
              <div className="text-sm text-muted-foreground">Papers Loaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemStats.total_queries}</div>
              <div className="text-sm text-muted-foreground">Queries Asked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemStats.avg_papers_found.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Papers Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemStats.avg_response_time.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">✅</div>
              <div className="text-sm text-muted-foreground">OpenAI Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Search Settings
          </CardTitle>
          <CardDescription>
            Configure your search parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Number of papers to search: {papersToSearch[0]}
            </label>
            <Slider
              value={papersToSearch}
              onValueChange={setPapersToSearch}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 paper</span>
              <span>10 papers</span>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">OpenAI Integration Active</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              AI-powered research synthesis is enabled. You'll receive comprehensive answers that combine findings from multiple papers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Research Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about Lake Kinneret ecology and biogeochemistry
          </CardDescription>
        </CardHeader>
        
        <CardContent className="rag-chat-container flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="rag-chat-messages flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rag-chat-message max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content)
                    }}
                    className="prose prose-sm max-w-none whitespace-pre-wrap break-words"
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.5'
                    }}
                  />
                  
                  {message.papersFound !== undefined && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {message.papersFound} papers found
                      </Badge>
                      {message.papersSearched && (
                        <Badge variant="outline" className="text-xs">
                          <Settings className="h-3 w-3 mr-1" />
                          Searched {message.papersSearched} papers
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-70 mt-2">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching through research papers...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="rag-chat-input flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about Lake Kinneret ecology..."
              className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Example Questions</CardTitle>
          <CardDescription>
            Click on any question to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {exampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="example-question-button justify-start h-auto p-3 text-left whitespace-normal"
                onClick={() => handleExampleClick(question)}
              >
                <span className="text-sm break-words">{question}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Queries */}
      {systemStats.recent_queries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemStats.recent_queries.map((query, index) => (
                <div key={index} className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                  {query}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
