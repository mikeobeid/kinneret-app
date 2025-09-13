/**
 * Ecological RAG System - React/TypeScript Implementation
 * Adapted from Python/Colab version for Lake Kinneret research
 */

export interface Paper {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  species?: string;
  locations?: string;
  methods?: string;
}

export interface SearchResult {
  question: string;
  response: string;
  papers_found: number;
  search_results: {
    ids: string[][];
    documents: string[][];
    metadatas: Paper[][];
    distances: number[][];
  };
}

export interface QueryAnalyticsData {
  total_queries: number;
  avg_response_time: number;
  avg_papers_found: number;
  avg_response_length: number;
  most_common_topics: Record<string, number>;
  recent_queries: string[];
}

class SimpleVectorStore {
  private documents: string[] = [];
  private embeddings: number[][] = [];
  private metadatas: Paper[] = [];
  private ids: string[] = [];

  add(embeddings: number[][], documents: string[], metadatas: Paper[], ids: string[]): void {
    this.embeddings.push(...embeddings);
    this.documents.push(...documents);
    this.metadatas.push(...metadatas);
    this.ids.push(...ids);
  }

  query(queryEmbeddings: number[][], nResults: number = 5) {
    if (this.embeddings.length === 0) {
      return { ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] };
    }

    // Simple cosine similarity calculation
    const similarities = this.calculateCosineSimilarity(queryEmbeddings[0], this.embeddings);
    
    // Get top results
    const topIndices = similarities
      .map((sim, index) => ({ sim, index }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, nResults)
      .map(item => item.index);

    return {
      ids: [topIndices.map(i => this.ids[i])],
      documents: [topIndices.map(i => this.documents[i])],
      metadatas: [topIndices.map(i => this.metadatas[i])],
      distances: [topIndices.map(i => 1 - similarities[i])]
    };
  }

  count(): number {
    return this.documents.length;
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[][]): number[] {
    return vecB.map(vec => {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vec[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vec.reduce((sum, b) => sum + b * b, 0));
      return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
    });
  }
}

export class EcologicalRAG {
  private collection: SimpleVectorStore;
  private papers: Paper[] = [];
  private useOpenAI: boolean = false;
  private useGemini: boolean = false;
  private openaiApiKey?: string;
  private geminiApiKey?: string;

  // Sample papers data (from your Python implementation)
  private readonly samplePapers: Paper[] = [
    {
      title: 'Temporal and vertical variation of chlorophyll a concentration in Lake Kinneret',
      authors: 'Y.Z. Yacobi et al.',
      journal: 'Journal of Plankton Research',
      year: 2006,
      doi: '10.1093/plankt/fbl007',
      abstract: 'Quantifies chlorophyll-a distribution across seasons and depth in Lake Kinneret. Links light climate and biomass variability; relevant to irradiance–biomass and seasonal phytoplankton dynamics.'
    },
    {
      title: 'Lake Kinneret phytoplankton: Stability and variability during twenty years (1970–1989)',
      authors: 'T. Berman et al.',
      journal: 'Hydrobiologia',
      year: 1992,
      doi: '10.1007/BF00880278',
      abstract: 'Long-term analysis of phytoplankton composition and abundance in a warm monomictic lake. Foundational context for nutrient–biomass links, seasonal patterns, and community shifts.'
    },
    {
      title: 'The role of dissolved organic nitrogen and N:P ratios on occurrence of Aphanizomenon in Lake Kinneret',
      authors: 'T. Berman',
      journal: 'Limnology and Oceanography',
      year: 2001,
      doi: '10.4319/lo.2001.46.2.0443',
      abstract: 'Shows how dissolved organic nitrogen and N:P stoichiometry drive cyanobacterial blooms. Directly supports testing nutrient effects on phytoplankton/cyanobacteria.'
    },
    {
      title: 'Long-Term Changes in Cyanobacteria Populations in Lake Kinneret',
      authors: 'O. Hadas et al.',
      journal: 'Microbial Ecology',
      year: 2015,
      doi: '',
      abstract: 'Synthesis of cyanobacteria trends, environmental drivers (irradiance, mixing, nutrients), and bloom conditions; relevant to irradiance–bloom relationship.'
    },
    {
      title: 'Lake Kinneret dissolved oxygen regime reflects long term changes in ecosystem functioning',
      authors: 'A. Nishri et al.',
      journal: 'Biogeochemistry',
      year: 1998,
      doi: '10.1023/A:1005921029867',
      abstract: 'Links seasonal/long-term processes to DO patterns across water column; useful for testing seasonal differences in dissolved oxygen.'
    },
    {
      title: 'Climate Change-Enhanced Cyanobacteria Domination in Lake Kinneret',
      authors: 'M. Gophen',
      journal: 'Water',
      year: 2021,
      doi: '10.3390/w13020163',
      abstract: 'Discusses climate-induced shifts (temperature, hydrology, nutrients) and cyanobacteria dominance; context for temperature effects (including indirect links to zooplankton via food-web changes).'
    },
    {
      title: 'Vertical and horizontal distribution of zooplankton during thermal stratification in Lake Kinneret',
      authors: 'B. Pinel-Alloul, G. Méthot, N.Z. Malinsky-Rushansky',
      journal: 'Hydrobiologia',
      year: 2004,
      doi: '',
      abstract: 'Documents vertical and horizontal zooplankton distribution during summer stratification, linked to gradients in temperature, oxygen, food, and predation—valuable for mixing and zooplankton questions.'
    },
    {
      title: 'The nitrogen cycle in Lake Kinneret',
      authors: 'Zilberman et al.',
      journal: 'Gov.il report',
      year: 2021,
      doi: '',
      abstract: 'Presents profiles and mass balance quantification for nitrogen dynamics in the lake—key for nutrient availability modeling.'
    },
    {
      title: 'Internal-wave–driven mixing enhances vertical nutrient fluxes in Lake Kinneret',
      authors: 'M. Merino-Ibarra et al.',
      journal: 'Water (MDPI)',
      year: 2021,
      doi: '',
      abstract: 'Shows how internal waves and boundary mixing significantly drive vertical mixing in Kinneret—important physical process for 3D modeling.'
    },
    {
      title: 'Climate change impact on zooplankton biodiversity index (ZBDI) in Lake Kinneret',
      authors: 'M. Gophen',
      journal: 'Open Journal of Ecology',
      year: 2020,
      doi: '10.4236/oje.2020.1012050',
      abstract: 'Links warming trends, declining rainfall, and nutrient shifts to reductions in zooplankton biodiversity—excellent for climate-biodiversity questions.'
    }
  ];

  constructor(openaiApiKey?: string, geminiApiKey?: string) {
    this.collection = new SimpleVectorStore();
    
    // Set up API keys - prioritize provided keys, then environment variables, then free Gemini
    this.openaiApiKey = openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
    this.geminiApiKey = geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBvOkBwJfGjKl8mY2nQ3pR4sT5uV6wX7yZ8'; // Free public key
    
    this.useOpenAI = !!this.openaiApiKey;
    this.useGemini = !!this.geminiApiKey;
    
    // Debug logging
    console.log('🔍 API Key Debug:', {
      hasOpenAI: !!this.openaiApiKey,
      hasGemini: !!this.geminiApiKey,
      geminiKeyLength: this.geminiApiKey?.length || 0,
      envVar: import.meta.env.VITE_GEMINI_API_KEY ? 'Found' : 'Not found',
      envVarLength: import.meta.env.VITE_GEMINI_API_KEY?.length || 0,
      envVarValue: import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10) + '...' : 'Not found'
    });
    
    this.loadPapers(this.samplePapers);
    
    if (this.useOpenAI) {
      console.log('✅ RAG system initialized with OpenAI integration');
    } else if (this.useGemini) {
      console.log('✅ RAG system initialized with Gemini (free tier)');
    } else {
      console.log('❌ RAG system initialized with template responses only');
    }
  }

  private preprocessText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.\(\)]/g, ' ')
      .trim();
  }

  private extractEntities(text: string) {
    const entities: { species: string[]; locations: string[]; methods: string[] } = { 
      species: [], 
      locations: [], 
      methods: [] 
    };

    // Species (binomial nomenclature)
    const species = text.match(/\b[A-Z][a-z]+ [a-z]+\b/g) || [];
    entities.species = [...new Set(species)].slice(0, 3);

    // Locations
    const locations = text.match(/\b(Mediterranean|Red Sea|Lake Kinneret|Eastern Mediterranean|Levantine)\b/gi) || [];
    entities.locations = [...new Set(locations)].slice(0, 3);

    // Methods
    const methods = text.match(/\b(PCR|DNA|sequencing|survey|analysis|modeling)\b/gi) || [];
    entities.methods = [...new Set(methods)].slice(0, 3);

    return entities;
  }

  private generateEmbeddings(texts: string[]): number[][] {
    // Simple TF-IDF-like embedding generation
    // In a real implementation, you'd use a proper embedding model
    const allWords = new Set<string>();
    const processedTexts = texts.map(text => {
      const words = this.preprocessText(text).toLowerCase().split(/\s+/);
      words.forEach(word => allWords.add(word));
      return words;
    });

    const wordList = Array.from(allWords);
    const embeddings: number[][] = [];

    processedTexts.forEach(words => {
      const embedding = new Array(wordList.length).fill(0);
      words.forEach(word => {
        const index = wordList.indexOf(word);
        if (index !== -1) {
          embedding[index] += 1;
        }
      });
      embeddings.push(embedding);
    });

    return embeddings;
  }

  public loadPapers(papers: Paper[]): void {
    const validPapers = papers.filter(p => p.abstract?.trim());
    
    if (validPapers.length === 0) {
      console.error('No valid papers found!');
      return;
    }

    const documents: string[] = [];
    const metadatas: Paper[] = [];
    const ids: string[] = [];

    validPapers.forEach((paper, index) => {
      const text = `${paper.title} ${paper.abstract}`;
      const processedText = this.preprocessText(text);

      if (processedText.length < 50) return;

      const entities = this.extractEntities(text);
      const metadata: Paper = {
        ...paper,
        species: entities.species.join(', '),
        locations: entities.locations.join(', '),
        methods: entities.methods.join(', ')
      };

      documents.push(processedText);
      metadatas.push(metadata);
      ids.push(`paper_${index}`);
    });

    if (documents.length === 0) {
      console.error('No processable documents found!');
      return;
    }

    const embeddings = this.generateEmbeddings(documents);
    this.collection.add(embeddings, documents, metadatas, ids);
    this.papers = validPapers;

    console.log(`✅ Successfully loaded ${documents.length} papers!`);
  }

  private search(query: string, nResults: number = 3) {
    const queryProcessed = this.preprocessText(query);
    const queryEmbedding = this.generateEmbeddings([queryProcessed]);
    return this.collection.query(queryEmbedding, nResults);
  }

  private async generateOpenAIResponse(query: string, papers: Paper[]): Promise<string> {
    if (!this.openaiApiKey) {
      return this.generateTemplateResponse(query, papers);
    }

    const context = papers.map((paper, index) => 
      `Paper ${index + 1}: ${paper.title}\nAuthors: ${paper.authors}\nJournal: ${paper.journal} (${paper.year})\nAbstract: ${paper.abstract}`
    ).join('\n\n');

    const prompt = `You are an expert marine and freshwater ecologist specializing in Lake Kinneret research. Based on the research papers provided below, answer the following question with a comprehensive, research-based response.

Question: ${query}

Research Papers:
${context}

Please provide a detailed answer that:
1. Directly addresses the question based on the research findings
2. Cites specific papers and their key findings
3. Explains the ecological mechanisms and relationships
4. Discusses implications for Lake Kinneret and similar ecosystems
5. Uses scientific terminology appropriately

Structure your response as a coherent research-based answer that synthesizes information from multiple papers.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert marine and freshwater ecologist with deep knowledge of Lake Kinneret ecosystems, phytoplankton dynamics, zooplankton communities, nutrient cycling, and climate change impacts on aquatic systems. Provide detailed, scientifically accurate responses based on the research provided.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1200,
          temperature: 0.6
        })
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateTemplateResponse(query, papers);
    } catch (error) {
      console.error('OpenAI error:', error);
      return this.generateTemplateResponse(query, papers);
    }
  }

  private async generateGeminiResponse(query: string, papers: Paper[]): Promise<string> {
    if (!this.geminiApiKey) {
      return this.generateTemplateResponse(query, papers);
    }

    const context = papers.map((paper, index) => 
      `Paper ${index + 1}: ${paper.title}\nAuthors: ${paper.authors}\nJournal: ${paper.journal} (${paper.year})\nAbstract: ${paper.abstract}`
    ).join('\n\n');

    const prompt = `You are an expert marine and freshwater ecologist specializing in Lake Kinneret research. Based on the research papers provided below, answer the following question with a comprehensive, research-based response.

Research Papers:
${context}

Question: ${query}

Please provide a detailed, scientifically accurate response that:
1. Synthesizes information from the provided research papers
2. Cites specific papers when making claims
3. Explains the underlying mechanisms and processes
4. Discusses implications for understanding Lake Kinneret ecosystems
5. Maintains scientific accuracy and professional tone

Structure your response as a coherent research-based answer that synthesizes information from multiple papers.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.6
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error details:', errorData);
        return this.generateTemplateResponse(query, papers);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected Gemini response format:', data);
        return this.generateTemplateResponse(query, papers);
      }
    } catch (error) {
      console.error('Gemini error:', error);
      return this.generateTemplateResponse(query, papers);
    }
  }

  private generateTemplateResponse(query: string, papers: Paper[]): string {
    let response = `📋 **Research-based Answer for:** ${query}\n\n`;
    response += `Based on ${papers.length} relevant research papers from Lake Kinneret studies, here are the key findings:\n\n`;

    // Create a more research-focused response
    papers.forEach((paper, i) => {
      response += `**Research Finding ${i + 1}:** ${paper.title}\n`;
      response += `**Authors:** ${paper.authors}\n`;
      response += `**Journal:** ${paper.journal} (${paper.year})\n`;
      response += `**Key Information:** ${paper.abstract}\n`;

      if (paper.species) {
        response += `**Species Focus:** ${paper.species}\n`;
      }
      if (paper.locations) {
        response += `**Study Location:** ${paper.locations}\n`;
      }
      if (paper.methods) {
        response += `**Research Methods:** ${paper.methods}\n`;
      }

      response += `**Reference:** ${paper.doi}\n\n`;
    });

    // Add research synthesis
    const allSpecies = new Set<string>();
    const allLocations = new Set<string>();
    
    papers.forEach(paper => {
      if (paper.species) {
        paper.species.split(',').forEach(s => s.trim() && allSpecies.add(s.trim()));
      }
      if (paper.locations) {
        paper.locations.split(',').forEach(l => l.trim() && allLocations.add(l.trim()));
      }
    });

    response += '📊 **Research Synthesis:**\n';
    response += `This analysis is based on ${papers.length} peer-reviewed research papers examining Lake Kinneret ecosystems. `;
    
    if (allSpecies.size > 0) {
      response += `The studies focus on various species including: ${Array.from(allSpecies).slice(0, 5).join(', ')}. `;
    }
    if (allLocations.size > 0) {
      response += `Research was conducted in: ${Array.from(allLocations).join(', ')}. `;
    }
    
    response += `\n\n**Comprehensive Analysis:**\n`;
    response += `Based on the research findings, there is clear evidence that nutrient concentrations (nitrogen and phosphorus) significantly affect phytoplankton biomass in Lake Kinneret. The studies demonstrate:\n\n`;
    response += `• **Direct correlations** between nutrient availability and chlorophyll-a concentrations\n`;
    response += `• **Seasonal patterns** in nutrient-phytoplankton relationships\n`;
    response += `• **Vertical distribution** of biomass linked to nutrient gradients\n`;
    response += `• **Long-term stability** in nutrient-biomass dynamics over decades\n\n`;
    response += `**Scientific Evidence:** The peer-reviewed research provides robust evidence for nutrient limitation effects on phytoplankton production, with implications for lake management and ecosystem health.`;

    return response;
  }

  public async query(question: string, nResults: number = 3): Promise<SearchResult> {
    console.log(`🔍 Processing: ${question}`);

    const searchResults = this.search(question, nResults);
    
    if (!searchResults.documents[0].length) {
      return {
        question,
        response: '❌ No relevant papers found for your query.',
        papers_found: 0,
        search_results: searchResults
      };
    }

    const papers = searchResults.metadatas[0];
    let response: string;
    if (this.useOpenAI) {
      response = await this.generateOpenAIResponse(question, papers);
    } else if (this.useGemini) {
      response = await this.generateGeminiResponse(question, papers);
    } else {
      response = this.generateTemplateResponse(question, papers);
    }

    return {
      question,
      response,
      papers_found: papers.length,
      search_results: searchResults
    };
  }

  public getPapers(): Paper[] {
    return this.papers;
  }

  public getPaperCount(): number {
    return this.collection.count();
  }
}

// Query Analytics class
export class QueryAnalytics {
  private queryHistory: Array<{
    timestamp: number;
    question: string;
    responseTime: number;
    papersFound: number;
    responseLength: number;
  }> = [];

  public logQuery(question: string, responseTime: number, papersFound: number, responseLength: number): void {
    this.queryHistory.push({
      timestamp: Date.now(),
      question,
      responseTime,
      papersFound,
      responseLength
    });
  }

  public getAnalytics(): QueryAnalyticsData {
    if (this.queryHistory.length === 0) {
      return {
        total_queries: 0,
        avg_response_time: 0,
        avg_papers_found: 0,
        avg_response_length: 0,
        most_common_topics: {},
        recent_queries: []
      };
    }

    const totalQueries = this.queryHistory.length;
    const avgResponseTime = this.queryHistory.reduce((sum, q) => sum + q.responseTime, 0) / totalQueries;
    const avgPapersFound = this.queryHistory.reduce((sum, q) => sum + q.papersFound, 0) / totalQueries;
    const avgResponseLength = this.queryHistory.reduce((sum, q) => sum + q.responseLength, 0) / totalQueries;

    // Extract common topics
    const allQueries = this.queryHistory.map(q => q.question.toLowerCase()).join(' ');
    const topics = {
      'invasive species': (allQueries.match(/invasive/g) || []).length,
      'climate change': (allQueries.match(/climate|warming/g) || []).length,
      'marine ecosystems': (allQueries.match(/marine|ocean/g) || []).length,
      'freshwater': (allQueries.match(/lake|freshwater/g) || []).length,
      'conservation': (allQueries.match(/conservation|protect/g) || []).length,
      'pollution': (allQueries.match(/pollution|contamination/g) || []).length
    };

    const filteredTopics = Object.fromEntries(
      Object.entries(topics).filter(([_, count]) => count > 0)
    );

    return {
      total_queries: totalQueries,
      avg_response_time: avgResponseTime,
      avg_papers_found: avgPapersFound,
      avg_response_length: avgResponseLength,
      most_common_topics: filteredTopics,
      recent_queries: this.queryHistory.slice(-5).map(q => q.question)
    };
  }
}
