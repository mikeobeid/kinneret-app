/**
 * Enhanced RAG System Test
 * Demonstrates the new functionality with customizable paper search
 */

import { EcologicalRAG } from './ecological-rag';

export async function testEnhancedRAG() {
  console.log('🧪 Testing Enhanced RAG System...');
  
  const rag = new EcologicalRAG();
  
  // Test with different numbers of papers
  const testQuestions = [
    {
      question: 'Does the temperature of the water column affect the growth rate of zooplankton?',
      papers: 7
    },
    {
      question: 'How do nutrients affect phytoplankton biomass in Lake Kinneret?',
      papers: 5
    },
    {
      question: 'What causes cyanobacterial blooms?',
      papers: 3
    }
  ];

  for (const test of testQuestions) {
    console.log(`\n🔍 Testing: "${test.question}"`);
    console.log(`📊 Searching ${test.papers} papers...`);
    
    try {
      const result = await rag.query(test.question, test.papers);
      console.log('✅ Query successful!');
      console.log(`📋 Papers found: ${result.papers_found}`);
      console.log(`📝 Response length: ${result.response.length} characters`);
      console.log('🔍 Response preview:', result.response.substring(0, 150) + '...\n');
    } catch (error) {
      console.error('❌ Query failed:', error);
    }
  }
  
  console.log('🎉 Enhanced RAG testing completed!');
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testEnhancedRAG = testEnhancedRAG;
}
