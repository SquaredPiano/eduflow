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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build conversation history
        const conversationHistory = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        // Add system context if we have output content
        let systemPrompt = '';
        if (outputContent && outputType) {
          systemPrompt = `You are an AI learning assistant helping a student refine their ${outputType}. Here's the current content:\n\n${JSON.stringify(outputContent, null, 2)}\n\nHelp the student improve this content by answering their questions and providing suggestions.`;
          
          // Prepend system context to first message
          if (conversationHistory.length > 0) {
            conversationHistory[0].parts[0].text = `${systemPrompt}\n\n${conversationHistory[0].parts[0].text}`;
          }
        }

        const chat = model.startChat({
          history: conversationHistory.slice(0, -1), // All but last message
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({
          message: text,
          provider: 'gemini',
        });
      } catch (geminiError) {
        console.error('Gemini error, falling back to OpenRouter:', geminiError);
      }
    }

    // Fallback to OpenRouter
    if (openRouterApiKey) {
      try {
        // Build system message with output context
        const systemMessage: Message = {
          role: 'system',
          content: outputContent && outputType
            ? `You are an AI learning assistant helping a student refine their ${outputType}. Here's the current content:\n\n${JSON.stringify(outputContent, null, 2)}\n\nHelp the student improve this content by answering their questions and providing suggestions.`
            : 'You are an AI learning assistant helping students with their study materials. Be concise, helpful, and educational.',
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'EduFlow AI',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [systemMessage, ...messages],
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        return NextResponse.json({
          message: text,
          provider: 'openrouter',
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
