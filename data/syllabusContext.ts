import { Subject, GradeLevel } from '../types';

// Extracting key scope and sequence data from the provided text to guide the AI
export const SYLLABUS_CONTEXT: Record<Subject, string> = {
  [Subject.Math]: `
    Heritage-Based Junior Mathematics Syllabus (2024-2030).
    Key Topics: Number, Operations, Measures, Relationships.
    Grade 3-7 Progression:
    - Number: Numerals (0 to 10M), Place value, Ordinal numbers, Approximation, Fractions (Proper, Mixed, Decimals, Percentages).
    - Operations: Addition/Subtraction/Multiplication/Division of whole numbers, fractions and decimals. HCF and LCM.
    - Measures: Money (Financial literacy), Time (12/24hr, conversions), Mass, Length, Shapes (2D/3D properties), Perimeter, Area, Volume, Direction & Angles.
    - Relationships: Data handling (Tables, Graphs, Pie Charts, Mean/Mode/Median).
    Methodology: Learner-centred, ICT integration, IKS (Indigenous Knowledge Systems).
  `,
  [Subject.English]: `
    Heritage-Based Junior English Syllabus (2024-2030).
    Key Skills: Listening/Observing, Speaking/Signing, Reading, Writing/Brailling.
    Topics: 
    - Phonics (44 phonemes, silent letters, homophones).
    - Language Structures (Grammar, Tenses, Parts of Speech).
    - Reading (Intensive, Extensive, Comprehension, Summary).
    - Writing (Composition - Narrative, Descriptive, Letters - Formal/Informal, Reports).
    - Cross-cutting: Heritage, Environment, ICT, Rights.
  `,
  [Subject.Science]: `
    Science and Technology Heritage-Based Syllabus (2024-2030).
    Key Topics:
    - Health & Hygiene (Body parts, Disease prevention, Water sanitation).
    - Food & Nutrition (Balanced diet, Preservation, Food security).
    - Crops, Plants & Animals (Agriculture, Flora/Fauna, Ecosystems).
    - Environmental Awareness (Climate change, Conservation, Pollution).
    - Tools & Tech (Indigenous tools, ICT, Structures, Materials).
    - Energy & Fuels (Sources, Conservation, Renewable).
    - Disaster Risk Management.
    - Educational Tech & Innovation (Robotics coding intro, Digital skills).
  `,
  [Subject.Social]: `
    Heritage-Social Studies (Combined for this context based on Social Science samples).
    Topics:
    - Identity: Family, Totems, Culture, Norms & Values (Ubuntu/Unhu).
    - Cultural Heritage: National History, Sovereignty, Governance, Symbols.
    - Social Services & Volunteerism.
    - Global Issues: Climate, Trade.
    - Legal & Constitution: Children's rights, Responsibilities.
    - Shelter & Housing.
  `,
  [Subject.Indigenous]: `
    Indigenous Language (Shona/Ndebele structure).
    Key Areas:
    - Nzwisiso (Comprehension), Pfupiso (Summary).
    - Kushandisa Mutauro (Language Usage - Tsumo, Madimikira, Grammar).
    - Rondedzero (Composition - Creative writing, Letters).
    - Tsika (Culture & Heritage).
    - Listening & Speaking skills tailored to local context.
  `,
  [Subject.PE_Arts]: `
    Physical Education and Arts Syllabus (2024-2030).
    Topics:
    - Safety & Health.
    - Human Body.
    - History of Arts (Music, Visual Arts, Theatre, Dance pre/post-colonial).
    - Gymnastics (Balances, Locomotion).
    - Sport & Game Skills (Invasion, Target, Net, Striking, Adventure, Aquatic, Athletics).
    - Creative Processes & Performance (Music composition, Visual Art creation, Theatre).
    - Aesthetic Values.
    - Enterprise (Careers in PE & Arts).
  `
};

export const getSyllabusForGrade = (grade: GradeLevel, subject: Subject): string => {
  return `Context for ${grade} ${subject}: ${SYLLABUS_CONTEXT[subject]}. Ensure content is age-appropriate for ${grade}.`;
};
