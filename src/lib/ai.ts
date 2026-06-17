import type { GuessPaperContent } from "@/types";

const TOPICS = [
  "Introduction & Fundamentals",
  "Core Concepts & Definitions",
  "Historical Development",
  "Theoretical Framework",
  "Practical Applications",
  "Case Studies",
  "Problem Solving Techniques",
  "Research Methodology",
  "Data Analysis",
  "Ethics & Professional Practice",
  "Emerging Trends",
  "Industry Standards",
  "Comparative Analysis",
  "Critical Evaluation",
  "Integration & Synthesis",
];

export function generateFallbackPaper(
  university: string,
  course: string
): GuessPaperContent {
  const mcqs = Array.from({ length: 30 }, (_, i) => ({
    question: `${course} MCQ ${i + 1}: Which concept is most relevant to ${TOPICS[i % TOPICS.length]} at ${university}?`,
    options: [
      `Fundamental principle of ${course}`,
      `Advanced application in ${university} curriculum`,
      `Historical perspective of the field`,
      `None of the above`,
    ],
    answer: "A",
  }));

  const shortQuestions = Array.from(
    { length: 20 },
    (_, i) =>
      `Explain ${TOPICS[i % TOPICS.length]} with reference to ${course} syllabus at ${university}. (5 marks)`
  );

  const longQuestions = Array.from(
    { length: 10 },
    (_, i) =>
      `Discuss in detail the significance of ${TOPICS[i % TOPICS.length]} in ${course}. Include examples from ${university} exam patterns. (15 marks)`
  );

  const topics = TOPICS.map((topic, i) => ({
    topic,
    probability: i < 5 ? "high" : i < 10 ? "medium" : "low",
    notes: `Frequently appears in ${university} ${course} past papers`,
  }));

  const tips = [
    `Focus on ${TOPICS[0]} and ${TOPICS[1]} — highest probability for ${university}.`,
    `Review past 5 years ${course} papers from ${university}.`,
    `Practice MCQs daily — aim for 30 per session.`,
    `Create short notes for all ${TOPICS.length} core topics.`,
    `Attempt long questions with diagrams where applicable.`,
    `Join study groups for ${course} at ${university}.`,
    `Use official course outline as your primary guide.`,
    `Time yourself: 2 min/MCQ, 10 min/short, 25 min/long question.`,
  ];

  return {
    sectionA: { title: "Section A - MCQs (30 Questions)", mcqs },
    sectionB: { title: "Section B - Short Questions (20 Questions)", questions: shortQuestions },
    sectionC: { title: "Section C - Long Questions (10 Questions)", questions: longQuestions },
    sectionD: { title: "Section D - Important Topics", topics },
    sectionE: { title: "Section E - Study Tips", tips },
  };
}

export async function generateGuessPaper(
  university: string,
  course: string,
  template: string
): Promise<GuessPaperContent> {
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackPaper(university, course);
  }

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: template },
        {
          role: "user",
          content: `Generate a complete guess paper for "${course}" at "${university}" (Pakistan). Include exactly 30 MCQs, 20 short questions, 10 long questions, important topics, and study tips. Return JSON matching the required structure.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content) as GuessPaperContent;
    if (!parsed.sectionA?.mcqs?.length) throw new Error("Invalid structure");
    return parsed;
  } catch {
    return generateFallbackPaper(university, course);
  }
}

export function paperToText(
  title: string,
  content: GuessPaperContent
): string {
  let text = `${title}\n${"=".repeat(title.length)}\n\n`;

  text += `${content.sectionA.title}\n${"-".repeat(40)}\n`;
  content.sectionA.mcqs.forEach((m, i) => {
    text += `\n${i + 1}. ${m.question}\n`;
    m.options.forEach((o, j) => {
      text += `   ${String.fromCharCode(65 + j)}. ${o}\n`;
    });
    text += `   Answer: ${m.answer}\n`;
  });

  text += `\n\n${content.sectionB.title}\n${"-".repeat(40)}\n`;
  content.sectionB.questions.forEach((q, i) => {
    text += `\n${i + 1}. ${q}\n`;
  });

  text += `\n\n${content.sectionC.title}\n${"-".repeat(40)}\n`;
  content.sectionC.questions.forEach((q, i) => {
    text += `\n${i + 1}. ${q}\n`;
  });

  text += `\n\n${content.sectionD.title}\n${"-".repeat(40)}\n`;
  content.sectionD.topics.forEach((t) => {
    text += `\n• ${t.topic} [${t.probability}] - ${t.notes}\n`;
  });

  text += `\n\n${content.sectionE.title}\n${"-".repeat(40)}\n`;
  content.sectionE.tips.forEach((t, i) => {
    text += `\n${i + 1}. ${t}\n`;
  });

  return text;
}
