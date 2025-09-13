/**
 * Simple test file for RAG functionality
 * This can be used to test the RAG system independently
 */

import { EcologicalRAG } from './ecological-rag';

export async function testRAGSystem() {
  console.log('🧪 Testing RAG System...');
  
  const rag = new EcologicalRAG();
  
  // Test basic functionality
  console.log(`📚 Papers loaded: ${rag.getPaperCount()}`);
  
  // Test a simple query
  try {
    const result = await rag.query('What affects phytoplankton biomass in Lake Kinneret?');
    console.log('✅ Query successful!');
    console.log(`📊 Papers found: ${result.papers_found}`);
    console.log(`📝 Response length: ${result.response.length} characters`);
    console.log('🔍 Response preview:', result.response.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Query failed:', error);
    return false;
  }
}

// Export for potential use in browser console
if (typeof window !== 'undefined') {
  (window as any).testRAGSystem = testRAGSystem;
}
