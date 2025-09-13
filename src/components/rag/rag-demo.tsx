import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Brain, Search } from 'lucide-react';

export function RAGDemo() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          How the Enhanced RAG System Works
        </CardTitle>
        <CardDescription>
          Advanced research question answering with customizable paper search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              <span className="font-medium">1. Ask Question</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ask specific research questions about Lake Kinneret ecology, such as temperature effects on zooplankton.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">2. Choose Papers</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Select how many research papers to search (1-10) using the slider to control search depth.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="font-medium">3. Get AI Answer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive a comprehensive, research-based answer that synthesizes findings from multiple papers.
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Example Usage:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Question</Badge>
              <span>"Does temperature affect zooplankton growth in Lake Kinneret?"</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Papers</Badge>
              <span>Search 7 papers</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Response</Badge>
              <span>AI-generated research synthesis with citations</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-green-900">✅ AI Integration Active:</h4>
          <p className="text-sm text-green-800">
            OpenAI integration is built-in and active! You'll automatically receive comprehensive AI-generated responses that provide deep analysis and synthesis of research findings from multiple papers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
