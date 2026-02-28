export interface Testimonial {
  quote: string;
  author: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' }
] as const;

export const heroCopy = {
  headline: 'Track in seconds. Calibrate over time.',
  subtext:
    'Caligo Tracker keeps logging light with swipe actions and adjusts targets from weight trends over time, so you can focus on habits instead of perfect entries.'
} as const;

export const howItWorks = {
  title: 'How it works',
  lead: 'Designed for steady habits, not all-day logging.',
  steps: [
    {
      title: 'Swipe to log intake or exercise',
      body: 'Main screen swipes let you capture the moment in a few taps, then move on with your day.',
      icon: 'hand'
    },
    {
      title: 'Log weight with a dial or keyboard',
      body: 'Use the dial for quick check-ins, or type manually whenever you want precision.',
      icon: 'scale'
    },
    {
      title: 'Auto-calibration learns from trends',
      body: 'After an initial calibration phase (about 14 days), targets adapt to your weight trend instead of single-day noise.',
      icon: 'line-chart'
    }
  ]
} as const;

export const features = [
  {
    title: 'Low-friction logging',
    body: 'Swipe-first interactions keep tracking lightweight enough to sustain long-term.',
    icon: 'zap'
  },
  {
    title: 'Trend-based calibration',
    body: 'Targets move with trend data, so you do not need per-meal perfection to stay on track.',
    icon: 'trending-up'
  },
  {
    title: 'Minimalist by default',
    body: 'No cluttered dashboards. Just what you need to make a small decision right now.',
    icon: 'layout-dashboard'
  },
  {
    title: 'Manual weight entry optional',
    body: 'Dial when you want speed, type when you want control. Both stay in sync.',
    icon: 'sliders-horizontal'
  }
] as const;

export const trustNotes = {
  title: 'Built with safety in mind',
  points: [
    'Caligo Tracker is informational only and not medical advice.',
    'The app is not designed for diagnosing, treating, or preventing disease.',
    'If food or body tracking feels distressing, pause and seek professional support.'
  ],
  resourceLabel: 'National Eating Disorders Association resources',
  resourceHref: 'https://www.nationaleatingdisorders.org/get-help/'
} as const;

export const screenshotCards = [
  {
    src: '/screenshots/screen-1.svg',
    alt: 'Placeholder Caligo Tracker home swipe logger',
    caption: 'Swipe logger'
  },
  {
    src: '/screenshots/screen-2.svg',
    alt: 'Placeholder Caligo Tracker dial weight entry screen',
    caption: 'Weight dial'
  },
  {
    src: '/screenshots/screen-3.svg',
    alt: 'Placeholder Caligo Tracker trend calibration graph',
    caption: 'Trend graph'
  },
  {
    src: '/screenshots/screen-4.svg',
    alt: 'Placeholder Caligo Tracker daily summary sheet',
    caption: 'Daily summary'
  },
  {
    src: '/screenshots/screen-5.svg',
    alt: 'Placeholder Caligo Tracker quick add panel',
    caption: 'Quick add'
  }
] as const;

export const testimonials: Testimonial[] = [
  {
    quote:
      'The swipe flow is the first logger I have kept using daily without feeling like a second job.',
    author: 'Early tester',
    detail: 'Using Caligo for daily check-ins'
  },
  {
    quote:
      'After around eight months of daily use, the calibration felt more useful than trying to estimate every meal perfectly.',
    author: 'Beta user',
    detail: '8 months placeholder testimonial'
  },
  {
    quote:
      'I like that it feels neutral and calm. It nudges consistency, not pressure.',
    author: 'Private beta participant',
    detail: 'Habit-focused experience'
  }
];

export const faqItems: FaqItem[] = [
  {
    question: 'Is it accurate?',
    answer:
      'Caligo Tracker estimates patterns, not laboratory precision. Accuracy improves as your weight-trend data builds over time.'
  },
  {
    question: "What if I do not know exact calories?",
    answer:
      'You can still log quickly using estimates. The app is designed around trend feedback instead of perfect single entries.'
  },
  {
    question: 'What is calibration?',
    answer:
      'Calibration is the first phase where Caligo compares logged intake, activity, and weight trends to tune your target. It typically takes about 14 days.'
  },
  {
    question: 'Do I need to log every day?',
    answer:
      'Daily logging helps, but missing days are okay. Calibration works best with consistent signals over weeks, not flawless streaks.'
  },
  {
    question: 'Does it track macros?',
    answer:
      'The core product focuses on calories, exercise, and trend calibration. Macro tracking is not the primary experience today.'
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. For this landing demo, waitlist data is stored locally if no endpoint is configured. Future cloud sync details will be disclosed before launch.'
  },
  {
    question: 'Is this medical or coaching advice?',
    answer:
      'No. Caligo Tracker is a self-tracking tool and should not replace qualified medical guidance.'
  }
];

export const waitlistCopy = {
  title: 'Start Tracking',
  lead: 'Get an instant invite to the TestFlight beta',
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  cta: 'Send Invite',
  privacyNote: 'By submitting, you agree to our '
} as const;

export const footerCopy = {
  socialLinks: [
    { label: 'X', href: 'https://x.com/caligotracker' },
    { label: 'Instagram', href: 'https://instagram.com/caligotracker' },
    { label: 'GitHub', href: 'https://github.com/caligotracker' }
  ],
  legalNotice: 'Caligo Tracker is not intended for medical diagnosis or treatment.'
} as const;
