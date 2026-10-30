-- Step 3 seed data: the six suggested topics and the six POC courses.
--
-- Run after migrations/0001_catalog.sql, in the Supabase SQL Editor.
-- Safe to re-run: it empties both tables first.

truncate public.listings, public.categories restart identity;

insert into public.categories (name, sort_order) values
  ('Literacy', 1),
  ('EdTech & AI', 2),
  ('ESL & ELL', 3),
  ('Special education', 4),
  ('Classroom management', 5),
  ('Leadership', 6);

insert into public.listings
  (title, category, trainer_name, trainer_role, format, hours, price_usd, grades, tags,
   description, outcomes, cover_color, cover_accent, cover_type, recommended_rank)
values
  (
    'The science of reading, made practical',
    'Literacy',
    'Sarah Mitchell',
    'Elementary literacy coach · 14 years in education',
    'Live online', 2, 79,
    array['K–5'],
    array['Reading', 'Phonics', 'Evidence-based'],
    'Bring structured literacy into your everyday teaching with a clear, practical introduction to the science of reading.',
    array[
      'Plan explicit phonics instruction',
      'Connect decoding, fluency, and comprehension',
      'Leave with a ready-to-use lesson framework'
    ],
    '#dbe7da', '#527a5a', 'books', 1
  ),
  (
    'AI tools that give teachers time back',
    'EdTech & AI',
    'James Rivera',
    'Technology integration specialist · 10 years in education',
    'Live online', 1.5, 49,
    array['K–5', '6–8', '9–12'],
    array['AI', 'Lesson planning', 'Productivity'],
    'Explore practical ways to use AI for planning, differentiation, and feedback, with thoughtful attention to privacy and teacher judgment.',
    array[
      'Create adaptable lesson outlines',
      'Draft differentiated classroom resources',
      'Evaluate AI output for accuracy and bias'
    ],
    '#e7dff6', '#8264ad', 'tech', 2
  ),
  (
    'Every voice belongs: supporting ELLs',
    'ESL & ELL',
    'Maria Santos',
    'ESL teacher & instructional coach · 12 years in education',
    'Live online', 2, 89,
    array['K–5', '6–8'],
    array['ESL', 'Language development', 'Inclusion'],
    'Build a welcoming classroom where multilingual learners can participate, connect, and succeed across subjects.',
    array[
      'Use visual and language scaffolds',
      'Plan purposeful student conversations',
      'Adapt content without lowering expectations'
    ],
    '#f2e3d2', '#b7824f', 'language', 3
  ),
  (
    'A calmer classroom starts with connection',
    'Classroom management',
    'David Chen',
    'Middle school teacher & mentor · 16 years in education',
    'In person', 3, 199,
    array['K–5', '6–8', '9–12'],
    array['Behavior', 'Relationships', 'Routines'],
    'Develop predictable routines and positive relationships that help students feel safe and ready to learn. Sample location: South Florida; travel arrangements by agreement.',
    array[
      'Set clear, teachable routines',
      'Practice responses to challenging behavior',
      'Create a classroom connection plan'
    ],
    '#e2e9ed', '#568292', 'classroom', 4
  ),
  (
    'Small shifts for an inclusive classroom',
    'Special education',
    'Emily Parker',
    'Special education specialist · 11 years in education',
    'Live online', 2.5, 69,
    array['K–5', '6–8', '9–12'],
    array['UDL', 'Differentiation', 'Accessibility'],
    'Discover accessible lesson design and practical adaptations that help more learners access the same classroom experience.',
    array[
      'Apply Universal Design for Learning principles',
      'Offer flexible ways to participate',
      'Identify barriers in everyday lesson materials'
    ],
    '#f0ddd9', '#b2736e', 'inclusive', 5
  ),
  (
    'From teacher to instructional leader',
    'Leadership',
    'Rachel Bennett',
    'Instructional leadership coach · 18 years in education',
    'Live online', 4, 149,
    array['K–5', '6–8', '9–12'],
    array['Coaching', 'Teacher leadership', 'Collaboration'],
    'Take the next step in leading colleagues through supportive coaching, collaborative planning, and purposeful professional conversations.',
    array[
      'Structure a productive coaching conversation',
      'Facilitate collaborative team learning',
      'Build a personal leadership action plan'
    ],
    '#e8e4d4', '#8f8654', 'leadership', 6
  );
