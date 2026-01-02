import { GoogleGenAI } from "@google/genai";
import { UserInput, Subject, SchemeOfWork, SchemeEntry, LessonInput, LessonPlan, FlashcardInput, FlashcardSet, AssessmentInput, Assessment, AssessmentType, ExamInput, ExamPaper } from "../types";
import { getSyllabusForGrade } from "../data/syllabusContext";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Scheme Generator Logic ---
export const generateSubjectScheme = async (
  input: UserInput,
  subject: Subject
): Promise<SchemeOfWork> => {
  const syllabusContext = getSyllabusForGrade(input.grade, subject);
  
  const systemInstruction = `You are an expert Zimbabwean Primary School teacher and curriculum developer creating a 'Scheme-Cum-Plan'.
  Your task is to create a detailed Scheme of Work for ${input.grade} ${subject} for ${input.term} ${input.year}.
  
  Strictly adhere to the MoPSE (Ministry of Primary and Secondary Education) Zimbabwe heritage-based curriculum standards (2024-2030).
  
  Input Context:
  ${syllabusContext}
  
  Format Requirements:
  - Return ONLY a valid JSON object.
  - The JSON must match the following structure exactly:
  {
    "aims": ["List 5-7 broad subject aims for the term"],
    "topicsCovered": ["List main topics for the term"],
    "crossCuttingIssues": ["List cross cutting issues e.g. Disaster Risk Management, ICT, Heritage"],
    "entries": [
      {
        "week": 1,
        "weekEnding": "Date string",
        "weeklyAim": "By the end of the week, learners should be able to...",
        "lessonLabel": "Lesson 1",
        "topic": "Main Topic",
        "subTopic": "Specific Content",
        "objectives": ["During the lesson, learners should be able to:", "- objective 1", "- objective 2"],
        "skills": ["List of skills e.g., Critical thinking, Dexterity"],
        "som": "Syllabus page ref (e.g., Syllabus Pg 44) \\n Textbook ref (e.g. Ventures Pg 12)",
        "media": "List teaching aids (e.g., Charts, ICT tools, Models, Flash cards)",
        "activities": [
          "Assumed knowledge: ...",
          "Introduction: ...",
          "Step 1: ...",
          "Step 2: ...",
          "Step 3: Group activities on...",
          "Step 4: Feedback...",
          "Step 5: Individual work...",
          "Conclusion: ..."
        ]
      }
    ]
  }
  
  Detailed Guidelines (CRITICAL):
  1. **Grade Specificity**: The syllabus has different columns for different grades. You MUST select content strictly from the **${input.grade}** column. Do not use content intended for lower or higher grades. Cover all aspects of the ${input.grade} syllabus for this term.
  2. **Lesson Granularity**: For EVERY week, you MUST generate **7 distinct lessons** (Lesson 1 to Lesson 7).
     - **DO NOT GROUP LESSONS** (e.g. Do NOT write "Lesson 1&2").
     - Write "Lesson 1" as one entry, "Lesson 2" as the next entry, etc.
     - If a topic takes long, split it into Part 1 (Lesson 1) and Part 2 (Lesson 2).
  3. **Activities**: Must use the "Assumed Knowledge -> Introduction -> Step 1... -> Conclusion" format.
  4. **Objectives**: Phrasing must be: "During the lesson, learners should be able to: - [action verb]..."
  5. **Content**: Must be Heritage Based (HBC). Integrate ICT, Indigenous Knowledge Systems (IKS), and practical skills.
  6. **References**: Provide plausible page numbers for "Junior ${subject} Syllabus MoPSE 2024" and relevant textbooks.
  7. **Coverage**: Do not leave any topic behind. Use the 7 lessons per week to ensure every small detail of the syllabus is covered.
  `;

  const prompt = `Generate a comprehensive Scheme-Cum-Plan for ${subject} ${input.grade} ${input.term} ${input.year}. 
  Start Date: ${input.startDate}.
  Generate content for 12 Weeks. 
  CRITICAL: Generate 7 separate lessons for EACH week (Lesson 1, Lesson 2, ... Lesson 7).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        subject: subject,
        grade: input.grade,
        term: input.term,
        year: input.year,
        teacherName: input.teacherName,
        aims: Array.isArray(data.aims) ? data.aims : [],
        topicsCovered: Array.isArray(data.topicsCovered) ? data.topicsCovered : [],
        crossCuttingIssues: Array.isArray(data.crossCuttingIssues) ? data.crossCuttingIssues : [],
        entries: Array.isArray(data.entries) ? data.entries : [],
      };
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating scheme:", error);
    throw new Error(`Failed to generate scheme for ${subject}`);
  }
};

// --- Lesson Planner Logic ---
export const generateSingleLessonPlan = async (input: LessonInput): Promise<LessonPlan> => {
  const syllabusContext = getSyllabusForGrade(input.grade, input.subject);

  const systemInstruction = `You are an expert Zimbabwean Primary School teacher.
  Create a DETAILED daily Lesson Plan for ${input.grade} ${input.subject}.
  
  STRICT SYLLABUS CONTEXT:
  ${syllabusContext}
  
  FORMATTING RULES:
  1. **Objectives**: Must be SMART. Example: "By the end of the lesson, learners should be able to: - define..."
  2. **SOM/Media**: Include concrete objects, ICT tools, and local heritage materials (e.g., maize seeds, stones).
  3. **Lesson Development**: You MUST generate exactly these stages in the 'lessonSteps' array:
     - **Introduction** (5 min): Link to assumed knowledge.
     - **Step 1** (10 min): Teacher demonstration / explanation of the concept.
     - **Step 2** (10 min): Guided practice / Group work / Hands-on activity.
     - **Step 3** (10 min): Individual work / ICT Integration / Game / Practical application.
     - **Conclusion** (5 min): Recap and fast assessment/quiz.
  4. **Methods/Competencies**: For each step, explicitly list the methods used (e.g., "Demonstration", "Discovery", "Q&A", "ICT Integration", "Problem Solving").
  
  JSON RESPONSE STRUCTURE:
  {
    "subTopic": "Specific focus of the lesson",
    "objectives": ["Objective 1", "Objective 2"],
    "materials": ["Item 1", "Item 2"],
    "assumedKnowledge": "Description of what learners already know.",
    "lessonSteps": [
       { "stage": "Introduction", "time": "5 min", "teacherActivity": "...", "learnerActivity": "...", "methods": "..." },
       { "stage": "Step 1: [Name of Step]", "time": "10 min", "teacherActivity": "...", "learnerActivity": "...", "methods": "..." },
       { "stage": "Step 2: [Name of Step]", "time": "10 min", "teacherActivity": "...", "learnerActivity": "...", "methods": "..." },
       { "stage": "Step 3: [Name of Step]", "time": "10 min", "teacherActivity": "...", "learnerActivity": "...", "methods": "..." },
       { "stage": "Conclusion", "time": "5 min", "teacherActivity": "...", "learnerActivity": "...", "methods": "..." }
    ],
    "evaluation": ""
  }`;

  const prompt = `Create a lesson plan for:
  Topic: "${input.topic}"
  Sub-Topic Context: "${input.context || 'General coverage'}"
  
  Content Requirement:
  - Use Heritage Based Curriculum concepts (local context, unhu/ubuntu).
  - Step 1 must be the delivery of the main concept.
  - Step 3 must be an activity (Written or Practical).
  - CRITICAL: Fill "methods" field for every step (e.g. Demonstration, Discussion).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      
      // Sanitise steps to ensure specific structure even if AI deviates slightly
      const steps = Array.isArray(data.lessonSteps) ? data.lessonSteps : [];
      
      return {
        grade: input.grade,
        subject: input.subject,
        topic: input.topic, 
        subTopic: data.subTopic || input.topic,
        date: input.date,
        duration: input.duration,
        teacherName: input.teacherName,
        objectives: Array.isArray(data.objectives) && data.objectives.length > 0 ? data.objectives : ["By the end of the lesson, learners should be able to master the topic."],
        materials: Array.isArray(data.materials) && data.materials.length > 0 ? data.materials : ["Chalkboard", "Textbooks", "Local Environment"],
        assumedKnowledge: data.assumedKnowledge || 'Learners have basic understanding of previous concepts.',
        lessonSteps: steps.length >= 3 ? steps : [
            { stage: "Introduction", time: "5 min", teacherActivity: "Introduces topic", learnerActivity: "Listen", methods: "Q&A" },
            { stage: "Step 1: Presentation", time: "10 min", teacherActivity: "Explains concept", learnerActivity: "Observe", methods: "Demonstration" },
            { stage: "Step 2: Practice", time: "10 min", teacherActivity: "Guides learners", learnerActivity: "Practice", methods: "Group Work" },
            { stage: "Step 3: Activity", time: "10 min", teacherActivity: "Supervises", learnerActivity: "Write/Do", methods: "Individual Work" },
            { stage: "Conclusion", time: "5 min", teacherActivity: "Concludes", learnerActivity: "Answer", methods: "Discussion" }
        ],
        evaluation: data.evaluation || ''
      } as LessonPlan;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw new Error(`Failed to generate lesson plan.`);
  }
};

// --- Flashcard Generator Logic ---
export const generateFlashcards = async (input: FlashcardInput): Promise<FlashcardSet> => {
  const syllabusContext = getSyllabusForGrade(input.grade, input.subject);

  const systemInstruction = `You are a teacher creating study flashcards for ${input.grade} students.
  Create ${input.count} flashcards for the Subject: ${input.subject}.
  
  Context: ${syllabusContext}
  
  Requirements:
  1. Content must be simple, clear, and age-appropriate.
  2. "Front" should be a Question, Term, or Brief Scenario.
  3. "Back" should be the Answer, Definition, or Result.
  4. Return ONLY a valid JSON object.
  5. JSON Structure: { "cards": [{ "front": "...", "back": "..." }] }
  `;

  const prompt = `Create ${input.count} flashcards on the topic: "${input.topic}".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      const cards = Array.isArray(data.cards) ? data.cards : [];
      
      // Map to add IDs if not present (though simple index usage is fine)
      const formattedCards: any[] = cards.map((c: any, i: number) => ({
        id: `card-${i}`,
        front: c.front || 'Front',
        back: c.back || 'Back'
      }));

      return {
        topic: input.topic,
        grade: input.grade,
        subject: input.subject,
        cards: formattedCards
      };
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
};

// --- Assessment Generator Logic ---
export const generateAssessment = async (input: AssessmentInput): Promise<Assessment> => {
  const syllabusContext = getSyllabusForGrade(input.grade, input.subject);

  const systemInstruction = `You are a strict examiner for Zimbabwean Primary Schools.
  Create a test/assessment for ${input.grade} ${input.subject}.
  
  Context: ${syllabusContext}
  Type: ${input.type}
  
  Format Guidelines:
  - **Mixed Type**: If type is 'Mixed', split questions into Section A (Multiple Choice) and Section B (Structured).
  - **Multiple Choice**: Must have 4 options (A, B, C, D).
  - **Structured**: Must require written answers.
  - **Comprehension**: You MUST generate a reading passage appropriate for ${input.grade}. The passage must be simple, engaging, and relevant to the topic. Questions must be based on this passage.
  - **Composition / Rondedzero**: Generate 4 different essay topics.
     - Include variety: Narrative, Descriptive, Letter (Formal/Informal), Report.
     - If subject is 'Indigenous Language', use Shona/Ndebele terms (Rondedzero/Indaba) and prompts.
     - If subject is 'English', use English prompts.
  - **Marks**: Assign marks per question (usually 1 for MCQ, 1-5 for structured, 20-30 for Composition).
  
  JSON Structure (Strict):
  {
    "title": "Topic Test: [Topic Name]",
    "passage": "[Optional: Only for Comprehension type, insert full text here]",
    "questions": [
      {
        "id": 1,
        "section": "A",
        "type": "mcq", 
        "question": "What is...",
        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
        "answer": "B. Option 2",
        "marks": 1
      },
      {
        "id": 2,
        "section": "Composition",
        "type": "composition",
        "question": "Write a story about...",
        "answer": "N/A",
        "marks": 20
      }
    ]
  }
  `;

  let typePrompt = "";
  if (input.type === AssessmentType.Mixed) {
    typePrompt = `Create ${Math.ceil(input.count / 2)} Multiple Choice questions (Section A) and ${Math.floor(input.count / 2)} Structured questions (Section B).`;
  } else if (input.type === AssessmentType.MultipleChoice) {
    typePrompt = `Create ${input.count} Multiple Choice questions.`;
  } else if (input.type === AssessmentType.Comprehension) {
    typePrompt = `Create a short, interesting reading passage titled '${input.topic}' suitable for ${input.grade}. Then create ${input.count} questions based on this passage.`;
  } else if (input.type === AssessmentType.Composition) {
    typePrompt = `Create 4 varied Composition/Rondedzero topics suitable for ${input.grade} ${input.subject}. Each should be worth 20 marks.`;
  } else {
    typePrompt = `Create ${input.count} Structured questions.`;
  }

  const prompt = `Generate an assessment on the topic: "${input.topic}". ${typePrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      const questions = Array.isArray(data.questions) ? data.questions : [];
      
      const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

      return {
        title: data.title || `${input.topic} Assessment`,
        grade: input.grade,
        subject: input.subject,
        topic: input.topic,
        passage: data.passage,
        questions: questions,
        totalMarks: totalMarks
      };
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating assessment:", error);
    throw new Error("Failed to generate assessment");
  }
};

// --- End of Term Exam Logic ---
export const generateEndTermExam = async (input: ExamInput): Promise<ExamPaper> => {
  const syllabusContext = getSyllabusForGrade(input.grade, input.subject);
  
  const systemInstruction = `You are a chief examiner for the ZIMSEC primary level.
  Create a comprehensive "End of Term Examination" for ${input.grade} ${input.subject} for ${input.term}.
  
  Context: ${syllabusContext}
  
  Task:
  Generate a balanced exam covering various topics from the syllabus typically taught in this term.
  
  Structure:
  - **Section A**: 20 Multiple Choice Questions (Recall & Knowledge). 1 Mark each.
  - **Section B**: 5-8 Structured/Short Answer Questions (Application & Comprehension). Total 30 Marks.
  - **Section C**: 2-3 Problem Solving/Essay/Composition Questions (Synthesis & Evaluation). Total 20-30 Marks.
  
  JSON Format:
  {
    "sections": [
      {
        "name": "Section A",
        "guidance": "Answer all questions. Each question carries 1 mark.",
        "sectionMarks": 20,
        "questions": [
           { "id": 1, "type": "mcq", "question": "...", "options": ["A.", "B.", "C.", "D."], "answer": "B...", "marks": 1 }
        ]
      },
      {
        "name": "Section B",
        "guidance": "Answer all questions in the spaces provided.",
        "sectionMarks": 30,
        "questions": [
           { "id": 21, "type": "structured", "question": "...", "answer": "...", "marks": 5 }
        ]
      },
      {
        "name": "Section C",
        "guidance": "Answer any two questions.",
        "sectionMarks": 20,
        "questions": [
           { "id": 30, "type": "structured", "question": "...", "answer": "...", "marks": 10 } 
           // If subject is English/Indigenous, make this Composition type
        ]
      }
    ]
  }
  
  Subject Specifics:
  - If English/Indigenous Language: Section C MUST be Composition/Rondedzero options.
  - If Math: Section C should be Word Problems/Data handling.
  - If Science/Social: Section C should be long answer explanations.
  `;

  const prompt = `Generate a full End of Term Examination for ${input.grade} ${input.subject} ${input.term}. Total marks approx 70-80.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      const sections = Array.isArray(data.sections) ? data.sections : [];
      const totalMarks = sections.reduce((sum: number, sec: any) => sum + (sec.sectionMarks || 0), 0);

      return {
        schoolName: input.schoolName,
        grade: input.grade,
        subject: input.subject,
        term: input.term,
        year: input.year,
        duration: input.duration,
        sections: sections,
        totalMarks: totalMarks
      };
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating exam:", error);
    throw new Error("Failed to generate exam");
  }
};
