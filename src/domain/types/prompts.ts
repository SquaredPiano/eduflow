/**
 * AGENT_PROMPTS - Comprehensive prompt engineering templates for all agents
 * 
 * Purpose: Centralized prompt definitions with system instructions and
 * templates for generating high-quality educational content
 */

export interface PromptConfig {
  system: string;
  template: (transcript: string, ...args: any[]) => string;
}

export const AGENT_PROMPTS: Record<string, PromptConfig> = {
  notes: {
    system: "You are an expert educator and note-taker who creates comprehensive, well-structured study notes from lecture transcripts.",
    template: (transcript: string) => `
Create comprehensive study notes from the following lecture transcript.
Format using markdown with clear headings, bullet points, and emphasis.

Include:
- **Key Concepts and Definitions**: Highlight important terms and their meanings
- **Main Ideas**: Summarize core topics covered
- **Important Examples**: Include relevant examples mentioned
- **Summary Section**: Brief recap of main takeaways

Transcript:
${transcript}

Provide well-organized, student-friendly notes that facilitate learning and review.
    `.trim(),
  },

  flashcards: {
    system: "You are a flashcard creator following spaced repetition principles and cognitive science best practices.",
    template: (transcript: string) => `
Generate 15-20 high-quality flashcards from the following content.
Create questions that test understanding, not just memorization.

Return ONLY valid JSON in this exact format:
[
  {
    "front": "Clear, concise question",
    "back": "Complete, accurate answer"
  }
]

Guidelines:
- Focus on key concepts, definitions, and important relationships
- Questions should be specific and unambiguous
- Answers should be complete but concise
- Include both factual recall and conceptual understanding questions

Transcript:
${transcript}

Return ONLY the JSON array, no additional text.
    `.trim(),
  },

  quiz: {
    system: "You are an experienced quiz creator who designs engaging, fair assessments that test student understanding.",
    template: (transcript: string, difficulty: string = "medium") => `
Create a ${difficulty}-level quiz with 10 multiple-choice questions from the following content.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

Guidelines:
- Questions should test understanding, not trick students
- All options should be plausible
- Distractors (wrong answers) should be reasonable but clearly incorrect
- The correct answer index (0-3) indicates which option is correct
- Include an explanation for each correct answer

Difficulty: ${difficulty}
Transcript:
${transcript}

Return ONLY the JSON object, no additional text.
    `.trim(),
  },

  slides: {
    system: "You are a presentation designer who extracts and organizes key information for educational slide decks.",
    template: (transcript: string) => `
Extract 8-12 key points from the following content and organize them as presentation slides.

Return ONLY valid JSON in this exact format:
[
  {
    "title": "Clear, concise slide title",
    "bullets": [
      "First key point",
      "Second key point",
      "Third key point"
    ]
  }
]

Guidelines:
- Each slide should cover one main topic or concept
- Use 2-4 bullet points per slide (max 5)
- Bullet points should be concise but complete thoughts
- Titles should clearly indicate the slide's focus
- Order slides logically to tell a coherent story

Transcript:
${transcript}

Return ONLY the JSON array, no additional text.
    `.trim(),
  },
};

// Legacy prompts for backward compatibility
export const PROMPTS = {
  notes: 'Summarize the transcript into clean, structured class notes.',
  quiz: 'Generate 5-10 concise quiz questions with answers from the transcript.'
};
