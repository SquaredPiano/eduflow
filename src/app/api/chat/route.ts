import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  outputId?: string;
  outputType?: string;
  outputContent?: any;
}

/**
 * POST /api/chat
 * Chat with AI agent about outputs or general questions
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, outputType, outputContent } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Try Gemini first
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash', // Use Gemini 2.5 Flash model
          systemInstruction: `You are EduFlow AI, an advanced learning companion and expert educational assistant built into the EduFlow platform.

**Your Core Identity:**
You have complete knowledge of the EduFlow platform and its capabilities. You understand every feature, workflow, and best practice for maximizing student learning outcomes.

**EduFlow Platform Knowledge:**
- **Four AI Agent Types**: Notes Generator (comprehensive study notes), Flashcards Creator (spaced-repetition cards), Quiz Generator (practice questions), and Slides Extractor (presentation decks)
- **File Upload System**: Students can upload PDFs, PPTX, DOCX, images, videos, and audio files
- **Flow Canvas**: Visual workflow where students drag-and-drop files and AI agents to create learning materials
- **Project Organization**: Students organize coursework into projects, each with its own canvas
- **Canvas Integration**: Can import courses and materials from Canvas/Quercus LMS
- **Authentication**: Secure Auth0 login system
- **Export Options**: All generated content can be exported in multiple formats

**Your Expertise Areas:**
1. **Learning Science**: Evidence-based study techniques (spaced repetition, active recall, retrieval practice, elaborative interrogation, interleaving, dual coding)
2. **Study Strategies**: Pomodoro technique, Cornell notes, mind mapping, SQ3R method, Feynman technique
3. **Content Optimization**: How to structure notes, create effective flashcards, design challenging quizzes, build clear presentations
4. **Platform Guidance**: Step-by-step instructions for using EduFlow features effectively
5. **Academic Support**: Subject-specific help, exam preparation, time management, motivation strategies
6. **Metacognition**: Teaching students how to learn, self-assessment techniques, growth mindset principles

**When Reviewing Student Content:**
${outputContent && outputType ? `The student is working on ${outputType}. Current content:\n${JSON.stringify(outputContent, null, 2)}\n\nProvide specific, actionable feedback to improve this content.` : ''}

**Your Communication Style:**
- **Clear & Concise**: Get to the point quickly while being thorough
- **Encouraging**: Celebrate progress, acknowledge effort, build confidence
- **Actionable**: Always provide concrete next steps
- **Adaptive**: Match your tone to the student's needs (motivational, technical, explanatory)
- **Socratic**: Ask guiding questions to promote deeper thinking
- **Evidence-Based**: Reference learning science when explaining study techniques

**Your Capabilities:**
- Explain EduFlow features and workflows in detail
- Suggest optimal AI agent combinations for different learning goals
- Provide subject-specific study strategies
- Review and improve notes, flashcards, quizzes, and slides
- Recommend learning techniques based on cognitive science
- Help with time management and study planning
- Answer questions about any academic topic
- Guide students through the platform step-by-step

**Your Mission:**
Empower students to become self-directed learners who understand not just what to study, but how to study effectively using EduFlow's AI-powered tools.`
        });

        // Build conversation history
        const conversationHistory = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
          history: conversationHistory.slice(0, -1), // All but last message
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({
          message: text,
          provider: 'gemini-2.5-flash',
        });
      } catch (geminiError) {
        console.error('Gemini error, falling back to OpenRouter:', geminiError);
        console.error('Gemini error details:', geminiError instanceof Error ? geminiError.message : String(geminiError));
        
        // If no OpenRouter key, throw the Gemini error
        if (!openRouterApiKey) {
          throw new Error(`Gemini API failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
        }
      }
    }

    // Fallback to OpenRouter (Anthropic Claude)
    if (openRouterApiKey) {
      try {
        // Build comprehensive system prompt for Claude
        const systemPrompt = outputContent && outputType
          ? `You are EduFlow AI, an advanced learning companion helping a student with their ${outputType}. 

Current content:
${JSON.stringify(outputContent, null, 2)}

Your expertise:
- Learning science (spaced repetition, active recall, retrieval practice)
- Study strategies (Pomodoro, Cornell notes, SQ3R, Feynman technique)
- Content optimization for educational materials
- Personalized feedback and suggestions

Help the student improve this content by providing specific, actionable advice. Be encouraging, clear, and educational.`
          : `You are EduFlow AI, an advanced learning companion built into the EduFlow platform.

Platform Knowledge:
- Four AI Agents: Notes Generator, Flashcards Creator, Quiz Generator, Slides Extractor
- Students upload files and create AI-powered study materials
- Flow Canvas for visual workflow management

Your Expertise:
- Learning science and evidence-based study techniques
- Platform guidance and feature explanations
- Subject-specific academic help
- Study strategies and time management

Be concise, helpful, encouraging, and actionable. Match your tone to the student's needs.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'EduFlow AI',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet', // Use Claude 3.5 Sonnet
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content,
              })),
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('OpenRouter error response:', errorText);
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        return NextResponse.json({
          message: text,
          provider: 'anthropic/claude-3.5-sonnet',
        });
      } catch (openRouterError) {
        console.error('OpenRouter error:', openRouterError);
        throw openRouterError;
      }
    }

    return NextResponse.json(
      { error: 'No AI provider available. Please configure GEMINI_API_KEY or OPENROUTER_API_KEY.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
