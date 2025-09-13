/**
 * Test OpenAI API integration
 */

import { EcologicalRAG } from './ecological-rag';

export async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI API Integration...');
  
  const rag = new EcologicalRAG();
  
  // Test a simple query
  try {
    console.log('🔍 Testing query: "Does temperature affect zooplankton in Lake Kinneret?"');
    console.log('📊 Searching 3 papers...');
    
    const result = await rag.query('Does temperature affect zooplankton in Lake Kinneret?', 3);
    
    console.log('✅ Query successful!');
    console.log(`📋 Papers found: ${result.papers_found}`);
    console.log(`📝 Response length: ${result.response.length} characters`);
    console.log('\n🤖 AI Response Preview:');
    console.log('=' * 50);
    console.log(result.response.substring(0, 500) + '...');
    console.log('=' * 50);
    
    // Check if it's using OpenAI or template
    if (result.response.includes('Research-based Answer for:')) {
      console.log('⚠️ Using template response (OpenAI may not be working)');
    } else {
      console.log('✅ Using OpenAI-generated response!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testOpenAIIntegration = testOpenAIIntegration;
}
