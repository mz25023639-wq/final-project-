export interface Mcq {
  question: string;
  options: string[];
  answer: string;
}

export interface GuessPaperContent {
  sectionA: {
    title: string;
    mcqs: Mcq[];
  };
  sectionB: {
    title: string;
    questions: string[];
  };
  sectionC: {
    title: string;
    questions: string[];
  };
  sectionD: {
    title: string;
    topics: { topic: string; probability: string; notes: string }[];
  };
  sectionE: {
    title: string;
    tips: string[];
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
  image?: string | null;
}
