
export enum GradeLevel {
  Grade3 = 'Grade 3',
  Grade4 = 'Grade 4',
  Grade5 = 'Grade 5',
  Grade6 = 'Grade 6',
  Grade7 = 'Grade 7',
}

export enum Term {
  Term1 = 'Term 1',
  Term2 = 'Term 2',
  Term3 = 'Term 3',
}

export enum Subject {
  Math = 'Mathematics',
  English = 'English Language',
  Science = 'Science and Technology',
  Social = 'Heritage and Social Studies',
  Indigenous = 'Indigenous Language (Shona/Ndebele)',
  PE_Arts = 'Physical Education and Arts'
}

export interface SchemeEntry {
  week: number;
  weekEnding: string;
  weeklyAim?: string;
  lessonLabel: string;
  topic: string;
  subTopic?: string;
  objectives: string[];
  skills: string[];
  som: string;
  media: string;
  activities: string[];
  evaluation: string;
}

export interface SchemeOfWork {
  subject: Subject;
  grade: GradeLevel;
  term: Term;
  year: string;
  teacherName: string;
  aims: string[];
  topicsCovered: string[];
  crossCuttingIssues: string[];
  entries: SchemeEntry[];
}

export interface UserInput {
  teacherName: string;
  grade: GradeLevel;
  term: Term;
  year: string;
  startDate: string;
}

// --- Lesson Planner Types ---

export interface LessonInput {
  teacherName: string;
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  context?: string; // Optional context like "Learners struggle with fractions"
  date: string;
  duration: number; // Minutes
}

export interface LessonStep {
  stage: string; // Introduction, Step 1, Step 2, Conclusion
  time: string; // e.g. "5 min"
  teacherActivity: string;
  learnerActivity: string;
  methods: string; // e.g. Discussion, Demonstration
}

export interface LessonPlan {
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  subTopic: string;
  date: string;
  duration: number;
  teacherName: string;
  objectives: string[];
  materials: string[]; // SOM / Media
  assumedKnowledge: string;
  lessonSteps: LessonStep[];
  evaluation: string;
}

// --- Flashcard Types ---

export interface FlashcardInput {
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  count: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  topic: string;
  grade: GradeLevel;
  subject: Subject;
  cards: Flashcard[];
}

// --- Assessment Types ---

export enum AssessmentType {
  MultipleChoice = 'Multiple Choice',
  Structured = 'Structured Questions',
  Mixed = 'Mixed (Section A & B)',
  Comprehension = 'Comprehension Passage',
  Composition = 'Composition / Rondedzero'
}

export interface AssessmentInput {
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  type: AssessmentType;
  count: number; // Number of questions
}

export interface AssessmentQuestion {
  id: number;
  section: string; // 'A' or 'B' or 'Composition'
  question: string;
  type: 'mcq' | 'structured' | 'composition';
  options?: string[]; // For MCQ (A, B, C, D)
  answer: string;
  marks: number;
}

export interface Assessment {
  title: string;
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  passage?: string;
  questions: AssessmentQuestion[];
  totalMarks: number;
}

// --- Exam Types ---

export interface ExamInput {
  schoolName: string;
  grade: GradeLevel;
  subject: Subject;
  term: Term;
  year: string;
  duration: string; // e.g. "2 hours"
}

export interface ExamSection {
  name: string; // Section A
  guidance: string; // Answer all questions
  questions: AssessmentQuestion[];
  sectionMarks: number;
}

export interface ExamPaper {
  schoolName: string;
  grade: GradeLevel;
  subject: Subject;
  term: Term;
  year: string;
  duration: string;
  sections: ExamSection[];
  totalMarks: number;
}

// --- Library Types ---

export type LibraryCategory = 'Past Papers' | 'Textbooks';

export interface LibraryDocument {
  id: string;
  name: string;
  category: LibraryCategory;
  uploadDate: string;
  dataUrl: string; // Base64 string for storage or Object URL
  size: string;
  type: string; // MIME type
  isDefault?: boolean;
}
