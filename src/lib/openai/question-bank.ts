/**
 * Common UX/UI interview questions (boss-curated bank).
 * Answers are intentionally NOT stored — used only as interview prompts.
 */

export type QuestionCategory =
  | "intro"
  | "project"
  | "process"
  | "collaboration"
  | "research"
  | "accessibility"
  | "tools"
  | "constraints"
  | "design_system"
  | "feedback"
  | "growth";

export type BankQuestion = {
  id: string;
  category: QuestionCategory;
  text: string;
  /** Prefer for junior / mid / senior (empty = any). */
  levels?: Array<"junior" | "mid" | "senior">;
};

export const UX_QUESTION_BANK: BankQuestion[] = [
  // Intro
  {
    id: "intro-1",
    category: "intro",
    text: "Tell me about yourself.",
  },

  // Projects & impact
  {
    id: "project-1",
    category: "project",
    text: "Can you share a challenging project and how you overcame it?",
  },
  {
    id: "project-2",
    category: "project",
    text: "Can you describe a project where you significantly improved user engagement?",
  },
  {
    id: "project-3",
    category: "project",
    text: "Tell me about a design decision you made that had a measurable impact.",
  },
  {
    id: "project-4",
    category: "project",
    text: "Describe a time when your first design solution did not work.",
  },
  {
    id: "project-5",
    category: "project",
    text: "Tell me about a time you improved an existing product rather than designing from scratch.",
  },
  {
    id: "project-6",
    category: "project",
    text: "Describe a project you are proud of and why.",
  },
  {
    id: "project-7",
    category: "project",
    text: "Tell me about a project that challenged you the most.",
  },
  {
    id: "project-8",
    category: "project",
    text: "Tell me about a project where the requirements were unclear.",
  },
  {
    id: "project-9",
    category: "project",
    text: "Describe a time you found a problem that was not included in the original brief.",
  },
  {
    id: "project-10",
    category: "project",
    text: "Tell me about a time you simplified a complex workflow.",
  },
  {
    id: "project-11",
    category: "project",
    text: "Describe a difficult usability issue you had to solve.",
  },
  {
    id: "project-12",
    category: "project",
    text: "Tell me about a project with a large amount of data.",
    levels: ["mid", "senior"],
  },

  // Process & craft
  {
    id: "process-1",
    category: "process",
    text: "How do you balance creativity with usability in your designs?",
  },
  {
    id: "process-2",
    category: "process",
    text: "How do you approach a new design project from start to finish?",
  },
  {
    id: "process-3",
    category: "process",
    text: "How do you approach mobile-first design?",
  },
  {
    id: "process-4",
    category: "process",
    text: "How do you make sure your designs are user-friendly for non-technical users?",
  },
  {
    id: "process-5",
    category: "process",
    text: "Describe a time you designed for multiple user types.",
  },
  {
    id: "process-6",
    category: "process",
    text: "Tell me about a time you had to make a decision without enough data.",
  },

  // Collaboration & stakeholders
  {
    id: "collab-1",
    category: "collaboration",
    text: "What’s your approach to collaboration with different teams?",
  },
  {
    id: "collab-2",
    category: "collaboration",
    text: "How do you keep stakeholders updated during the design process?",
  },
  {
    id: "collab-3",
    category: "collaboration",
    text: "Tell me about a time you had to defend a design decision.",
  },
  {
    id: "collab-4",
    category: "collaboration",
    text: "Describe a situation where stakeholders disagreed with each other.",
  },
  {
    id: "collab-5",
    category: "collaboration",
    text: "Tell me about a time you had to present work to senior stakeholders.",
  },
  {
    id: "collab-6",
    category: "collaboration",
    text: "How do you respond when a stakeholder says, “I just don’t like it”?",
  },
  {
    id: "collab-7",
    category: "collaboration",
    text: "Tell me about a time you had to say no to a stakeholder.",
  },
  {
    id: "collab-8",
    category: "collaboration",
    text: "Describe a time you worked closely with engineers.",
  },
  {
    id: "collab-9",
    category: "collaboration",
    text: "Tell me about a disagreement you had with an engineer.",
  },
  {
    id: "collab-10",
    category: "collaboration",
    text: "Tell me about a time the final implementation did not match the design.",
  },

  // Research & testing
  {
    id: "research-1",
    category: "research",
    text: "Can you give an example of how you approached user testing in one of your projects?",
  },
  {
    id: "research-2",
    category: "research",
    text: "What’s your strategy for gathering user feedback during the design process?",
  },
  {
    id: "research-3",
    category: "research",
    text: "How have you handled a situation where research was limited?",
  },
  {
    id: "research-4",
    category: "research",
    text: "Tell me about a time research changed the direction of a project.",
  },

  // Accessibility
  {
    id: "a11y-1",
    category: "accessibility",
    text: "How do you ensure accessibility in your designs?",
  },
  {
    id: "a11y-2",
    category: "accessibility",
    text: "Tell me about a time accessibility affected your design choices.",
  },

  // Tools & trends
  {
    id: "tools-1",
    category: "tools",
    text: "How do you choose the right design tools for a project?",
  },
  {
    id: "tools-2",
    category: "tools",
    text: "How do you keep up with the latest design trends and technologies?",
  },

  // Constraints & deadlines
  {
    id: "constraints-1",
    category: "constraints",
    text: "How do you handle tight deadlines without compromising on quality?",
  },
  {
    id: "constraints-2",
    category: "constraints",
    text: "Tell me about a project where you had to work under a tight deadline.",
  },
  {
    id: "constraints-3",
    category: "constraints",
    text: "Can you give an example of a project where you had to balance technical constraints with design quality?",
  },
  {
    id: "constraints-4",
    category: "constraints",
    text: "How have you handled technical constraints that affected the user experience?",
  },
  {
    id: "constraints-5",
    category: "constraints",
    text: "How do you handle situations where the project requirements change midway?",
  },

  // Design system
  {
    id: "ds-1",
    category: "design_system",
    text: "Tell me about your experience building or improving a design system.",
    levels: ["mid", "senior"],
  },
  {
    id: "ds-2",
    category: "design_system",
    text: "Tell me about a time a design system became too restrictive.",
    levels: ["mid", "senior"],
  },
  {
    id: "ds-3",
    category: "design_system",
    text: "How do you handle requests for one-off design exceptions?",
    levels: ["mid", "senior"],
  },

  // Feedback & growth
  {
    id: "feedback-1",
    category: "feedback",
    text: "Can you give an example of how you handle feedback?",
  },
  {
    id: "feedback-2",
    category: "feedback",
    text: "Tell me about a time you changed your mind after receiving feedback.",
  },
  {
    id: "growth-1",
    category: "growth",
    text: "What motivates you when working on a challenging design problem?",
  },
  {
    id: "growth-2",
    category: "growth",
    text: "Tell me about a mistake you made on a project.",
  },
];

/** Transferable behavioral questions when the role is not clearly UX/UI. */
export const GENERAL_BEHAVIORAL_BANK: BankQuestion[] = [
  {
    id: "gen-1",
    category: "intro",
    text: "Tell me about yourself.",
  },
  {
    id: "gen-2",
    category: "project",
    text: "Can you share a challenging project and how you overcame it?",
  },
  {
    id: "gen-3",
    category: "collaboration",
    text: "What’s your approach to collaboration with different teams?",
  },
  {
    id: "gen-4",
    category: "feedback",
    text: "Can you give an example of how you handle feedback?",
  },
  {
    id: "gen-5",
    category: "constraints",
    text: "How do you handle tight deadlines without compromising on quality?",
  },
  {
    id: "gen-6",
    category: "constraints",
    text: "How do you handle situations where the project requirements change midway?",
  },
  {
    id: "gen-7",
    category: "growth",
    text: "Tell me about a mistake you made on a project.",
  },
  {
    id: "gen-8",
    category: "project",
    text: "Describe a project you are proud of and why.",
  },
  {
    id: "gen-9",
    category: "collaboration",
    text: "Tell me about a disagreement you had with a teammate and how you resolved it.",
  },
  {
    id: "gen-10",
    category: "process",
    text: "How do you approach a new project from start to finish?",
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function isDesignRole(title: string, jobDescription: string) {
  return /\b(ux|ui|product design|designer|design system|figma|user experience|interaction design|visual design)\b/i.test(
    `${title} ${jobDescription}`,
  );
}

/**
 * Pick a varied sample from the bank for the planner.
 * Always includes "Tell me about yourself" when present, then mixes categories.
 */
export function sampleQuestionBank(input: {
  title: string;
  jobDescription: string;
  difficulty: "junior" | "mid" | "senior";
  durationMinutes: number;
}): BankQuestion[] {
  const design = isDesignRole(input.title, input.jobDescription);
  const source = design ? UX_QUESTION_BANK : GENERAL_BEHAVIORAL_BANK;

  const eligible = source.filter(
    (q) => !q.levels || q.levels.includes(input.difficulty),
  );

  const byCategory = new Map<QuestionCategory, BankQuestion[]>();
  for (const q of eligible) {
    const list = byCategory.get(q.category) ?? [];
    list.push(q);
    byCategory.set(q.category, list);
  }

  // Longer interviews get a larger sample for the model to choose from.
  const sampleSize =
    input.durationMinutes <= 5
      ? 10
      : input.durationMinutes <= 10
        ? 14
        : 18;

  const picked: BankQuestion[] = [];
  const intro = eligible.find((q) => q.category === "intro");
  if (intro) picked.push(intro);

  // Round-robin categories so we don't oversample projects.
  const categories = shuffle([...byCategory.keys()].filter((c) => c !== "intro"));
  let guard = 0;
  while (picked.length < sampleSize && guard < sampleSize * 4) {
    guard += 1;
    for (const cat of categories) {
      if (picked.length >= sampleSize) break;
      const pool = shuffle(byCategory.get(cat) ?? []).filter(
        (q) => !picked.some((p) => p.id === q.id),
      );
      if (pool[0]) picked.push(pool[0]);
    }
  }

  return picked;
}

export function formatBankForPrompt(questions: BankQuestion[]) {
  return questions.map((q, i) => `${i + 1}. [${q.category}] ${q.text}`).join("\n");
}
