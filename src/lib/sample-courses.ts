import type {Course} from './types';

/**
 * @fileoverview The six sample listings copied from the HTML POC.
 *
 * TEMPORARY: Step 2 moves these into the Supabase database as seed data and
 * this file is deleted. The POC's self-paced course (AI tools) is switched
 * to "Live online" because self-paced is deferred (SkipPD_v2.md, section 3).
 */
/** Sample catalog, in "recommended" order. */
export const SAMPLE_COURSES: Course[] = [
  {
    id: 1,
    title: 'The science of reading, made practical',
    category: 'Literacy',
    trainer: 'Sarah Mitchell',
    role: 'Elementary literacy coach · 14 years in education',
    format: 'Live online',
    hours: 2,
    price: 79,
    grades: ['K–5'],
    tags: ['Reading', 'Phonics', 'Evidence-based'],
    color: '#dbe7da',
    accent: '#527a5a',
    type: 'books',
    description:
      'Bring structured literacy into your everyday teaching with a clear, practical introduction to the science of reading.',
    outcomes: [
      'Plan explicit phonics instruction',
      'Connect decoding, fluency, and comprehension',
      'Leave with a ready-to-use lesson framework',
    ],
  },
  {
    id: 2,
    title: 'AI tools that give teachers time back',
    category: 'EdTech & AI',
    trainer: 'James Rivera',
    role: 'Technology integration specialist · 10 years in education',
    format: 'Live online',
    hours: 1.5,
    price: 49,
    grades: ['K–5', '6–8', '9–12'],
    tags: ['AI', 'Lesson planning', 'Productivity'],
    color: '#e7dff6',
    accent: '#8264ad',
    type: 'tech',
    description:
      'Explore practical ways to use AI for planning, differentiation, and feedback, with thoughtful attention to privacy and teacher judgment.',
    outcomes: [
      'Create adaptable lesson outlines',
      'Draft differentiated classroom resources',
      'Evaluate AI output for accuracy and bias',
    ],
  },
  {
    id: 3,
    title: 'Every voice belongs: supporting ELLs',
    category: 'ESL & ELL',
    trainer: 'Maria Santos',
    role: 'ESL teacher & instructional coach · 12 years in education',
    format: 'Live online',
    hours: 2,
    price: 89,
    grades: ['K–5', '6–8'],
    tags: ['ESL', 'Language development', 'Inclusion'],
    color: '#f2e3d2',
    accent: '#b7824f',
    type: 'language',
    description:
      'Build a welcoming classroom where multilingual learners can participate, connect, and succeed across subjects.',
    outcomes: [
      'Use visual and language scaffolds',
      'Plan purposeful student conversations',
      'Adapt content without lowering expectations',
    ],
  },
  {
    id: 4,
    title: 'A calmer classroom starts with connection',
    category: 'Classroom management',
    trainer: 'David Chen',
    role: 'Middle school teacher & mentor · 16 years in education',
    format: 'In person',
    hours: 3,
    price: 199,
    grades: ['K–5', '6–8', '9–12'],
    tags: ['Behavior', 'Relationships', 'Routines'],
    color: '#e2e9ed',
    accent: '#568292',
    type: 'classroom',
    description:
      'Develop predictable routines and positive relationships that help students feel safe and ready to learn. Sample location: South Florida; travel arrangements by agreement.',
    outcomes: [
      'Set clear, teachable routines',
      'Practice responses to challenging behavior',
      'Create a classroom connection plan',
    ],
  },
  {
    id: 5,
    title: 'Small shifts for an inclusive classroom',
    category: 'Special education',
    trainer: 'Emily Parker',
    role: 'Special education specialist · 11 years in education',
    format: 'Live online',
    hours: 2.5,
    price: 69,
    grades: ['K–5', '6–8', '9–12'],
    tags: ['UDL', 'Differentiation', 'Accessibility'],
    color: '#f0ddd9',
    accent: '#b2736e',
    type: 'inclusive',
    description:
      'Discover accessible lesson design and practical adaptations that help more learners access the same classroom experience.',
    outcomes: [
      'Apply Universal Design for Learning principles',
      'Offer flexible ways to participate',
      'Identify barriers in everyday lesson materials',
    ],
  },
  {
    id: 6,
    title: 'From teacher to instructional leader',
    category: 'Leadership',
    trainer: 'Rachel Bennett',
    role: 'Instructional leadership coach · 18 years in education',
    format: 'Live online',
    hours: 4,
    price: 149,
    grades: ['K–5', '6–8', '9–12'],
    tags: ['Coaching', 'Teacher leadership', 'Collaboration'],
    color: '#e8e4d4',
    accent: '#8f8654',
    type: 'leadership',
    description:
      'Take the next step in leading colleagues through supportive coaching, collaborative planning, and purposeful professional conversations.',
    outcomes: [
      'Structure a productive coaching conversation',
      'Facilitate collaborative team learning',
      'Build a personal leadership action plan',
    ],
  },
];
