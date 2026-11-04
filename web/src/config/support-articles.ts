/**
 * @fileoverview Support Center content: help articles grouped by category.
 *
 * Why this lives in config: the articles are plain text that support staff
 * will edit often. Keeping them here means adding or fixing an article is a
 * data edit, with no change to the pages that render them
 * (app/support/page.tsx and app/support/[article]/page.tsx).
 *
 * TEMPORARY: articles describe the Preview stage. Revisit them when accounts
 * (Step 4), bookings and payments (Step 7) go live, or move them to a CMS.
 */

/** One block of an article: an optional heading, paragraphs and a list. */
export interface SupportArticleSection {
  heading?: string;
  paragraphs?: string[];
  /** Shown as a numbered list when `ordered` is true, bullets otherwise. */
  list?: string[];
  ordered?: boolean;
}

/** A help article. Its URL is `/support/<slug>`. */
export interface SupportArticle {
  /** URL-safe id, unique across all categories. */
  slug: string;
  title: string;
  /** One-sentence teaser shown on the Support Center home page. */
  summary: string;
  sections: SupportArticleSection[];
}

/** A group of related articles on the Support Center home page. */
export interface SupportCategory {
  title: string;
  description: string;
  articles: SupportArticle[];
}

/** All Support Center articles, in display order. */
export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    title: 'Getting started',
    description: 'What SkipPD is and how to find your way around.',
    articles: [
      {
        slug: 'what-is-skippd',
        title: 'What is SkipPD?',
        summary: 'A marketplace for professional development led by working educators.',
        sections: [
          {
            paragraphs: [
              'SkipPD connects schools and teachers with professional development (PD) designed and delivered by fellow educators. Instead of generic one-size-fits-all sessions, you can browse trainings built by people who teach in real classrooms.',
            ],
          },
          {
            heading: 'Who uses SkipPD',
            list: [
              'Teachers who want to grow their own practice and book a training for themselves.',
              'Schools and districts planning PD days for a team or a whole staff.',
              'Educators who want to share their expertise by listing a training.',
            ],
          },
          {
            heading: 'Training formats',
            paragraphs: [
              'Trainings are offered live online or in person. Self-paced courses are not available yet.',
            ],
          },
        ],
      },
      {
        slug: 'preview-stage',
        title: 'What does "Preview" mean?',
        summary: 'SkipPD is in an early preview. Here is what works today.',
        sections: [
          {
            paragraphs: [
              'The "Preview" label next to the logo means SkipPD is still being built. You can explore the catalog and try every form, but some steps are not connected yet.',
            ],
          },
          {
            heading: 'Available now',
            list: [
              'Browsing, searching, filtering and sorting the training catalog.',
              'Saving trainings you like.',
              'Sending a training request and listing your own training (saved in your browser).',
            ],
          },
          {
            heading: 'Coming soon',
            list: [
              'Teacher and school accounts with login.',
              'Email notifications and a Jobs page for trainers.',
              'Chat between trainers and schools, secure payments and trainer ratings.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Finding & booking training',
    description: 'Search the catalog and request a session.',
    articles: [
      {
        slug: 'search-and-filter',
        title: 'How to search and filter trainings',
        summary: 'Narrow the catalog by keyword, format, grade, duration and price.',
        sections: [
          {
            heading: 'Search',
            paragraphs: [
              'Type a topic, skill or trainer name in the search box. Results update as you type and match titles, topics, trainers and keywords.',
            ],
          },
          {
            heading: 'Filters',
            list: [
              'Format: live online or in person.',
              'Grade level: K-5, 6-8 or 9-12.',
              'Duration: short sessions or longer workshops.',
              'Price: set a maximum price per person.',
            ],
          },
          {
            heading: 'Sort',
            paragraphs: [
              'Use the sort menu to order results by recommendation, price (low to high or high to low) or duration.',
            ],
          },
        ],
      },
      {
        slug: 'request-a-session',
        title: 'How to request a training session',
        summary: 'Send a request to a trainer with your date, group size and goals.',
        sections: [
          {
            list: [
              'Open a training from the catalog to see its full details.',
              'Click "Request a session".',
              'Fill in your name, email, who the training is for, the number of participants, your school and a preferred date.',
              'Add a short message about your goals, grade levels or team needs.',
              'Submit the request.',
            ],
            ordered: true,
          },
          {
            heading: 'What happens next',
            paragraphs: [
              'Once accounts launch, the trainer will be notified by email and can accept your request, suggest a different date or details, or decline. During the Preview, requests are saved in your browser only and are not sent to the trainer.',
            ],
          },
        ],
      },
      {
        slug: 'pricing',
        title: 'How is training priced?',
        summary: 'Prices are per person; the total depends on your group size.',
        sections: [
          {
            paragraphs: [
              'Each training shows a price per person in US dollars. The total for your booking is the price per person multiplied by the number of participants.',
              'For larger groups, trainers may agree on a different arrangement with you when they respond to your request.',
            ],
          },
          {
            heading: 'PD credit',
            paragraphs: [
              'Whether a training counts toward PD credit or certification hours is decided by your school or district. Please confirm eligibility with them before booking.',
            ],
          },
        ],
      },
      {
        slug: 'saved-and-requests',
        title: 'Where are my saved trainings and requests?',
        summary: 'During the Preview they are stored in your current browser.',
        sections: [
          {
            paragraphs: [
              'Click the heart on any training to save it, then open "Saved" in the header to see your list. Your training requests appear under "My requests".',
              'During the Preview both lists are stored in this browser only. Clearing your browser data, using a private window or switching devices will show empty lists. When accounts launch, they will move to your profile page.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'For trainers',
    description: 'Share your expertise by listing a training.',
    articles: [
      {
        slug: 'list-a-training',
        title: 'How to list your training',
        summary: 'Create a listing so schools and teachers can find you.',
        sections: [
          {
            list: [
              'Click "Become a PD trainer" or "List your training".',
              'Give your training a clear, specific title and choose a topic (or pick "Other" and type your own).',
              'Add the format, duration, price per person and grade levels.',
              'Write a description, your credentials and the learning outcomes participants can expect.',
              'Optionally upload a cover image (JPG, PNG or WebP, up to 1 MB).',
              'Publish your listing.',
            ],
            ordered: true,
          },
          {
            heading: 'Tips for a great listing',
            list: [
              'Be specific about who the training is for and what participants will be able to do afterwards.',
              'Write one learning outcome per line.',
              'Add keywords that schools are likely to search for.',
            ],
          },
        ],
      },
      {
        slug: 'responding-to-requests',
        title: 'Responding to training requests',
        summary: 'Accept, counter-propose or decline requests from schools.',
        sections: [
          {
            paragraphs: [
              'When accounts launch, every request for your training will appear on your Jobs page and you will get an email notification.',
            ],
          },
          {
            heading: 'Your options',
            list: [
              'Accept the request as it is.',
              'Counter-propose a different date or details. You and the school can go back and forth until you agree.',
              'Decline the request.',
            ],
          },
          {
            paragraphs: [
              'Each booking will have its own chat so you can settle the details with the school.',
            ],
          },
        ],
      },
      {
        slug: 'getting-paid',
        title: 'How will trainers get paid?',
        summary: 'Payments are held securely and released after the training.',
        sections: [
          {
            paragraphs: [
              'Payments are not live yet. Here is how they will work once they launch:',
            ],
          },
          {
            list: [
              'After you accept a request, the school pays through SkipPD. The payment is held securely by our payment provider.',
              'After the training date, you mark the booking as delivered.',
              'The school confirms the training took place, or it is confirmed automatically if they do not respond within 7 days.',
              'Your payment is then released to you.',
            ],
            ordered: true,
          },
          {
            heading: 'If a school disputes a booking',
            paragraphs: [
              'You will be asked to upload evidence, such as an attendance sheet, photos or a video-call log. The SkipPD team reviews it and makes a decision.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Accounts & privacy',
    description: 'Account types, your data and how to reach us.',
    articles: [
      {
        slug: 'account-types',
        title: 'Teacher and school accounts',
        summary: 'Two account types, each with its own experience.',
        sections: [
          {
            paragraphs: [
              'Accounts are coming soon. When you sign up you will choose one of two account types:',
            ],
          },
          {
            list: [
              'Teacher: list your own trainings, respond to requests on your Jobs page, and book other trainings for yourself.',
              'School (hiring party): browse, contact and book trainers for your team. School accounts cannot create listings.',
            ],
          },
        ],
      },
      {
        slug: 'contact-support',
        title: 'How to contact us',
        summary: 'Could not find your answer? Get in touch with the team.',
        sections: [
          {
            paragraphs: [
              'If you could not find what you need in these articles, visit our Contact Us page. Include as much detail as you can, such as the training title and what you were trying to do, so we can help faster.',
            ],
          },
        ],
      },
    ],
  },
];

/** Every article with the title of its category, in display order. */
export const ALL_SUPPORT_ARTICLES = SUPPORT_CATEGORIES.flatMap((category) =>
  category.articles.map((article) => ({...article, categoryTitle: category.title})),
);
