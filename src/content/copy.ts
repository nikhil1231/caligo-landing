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
  eyebrow: 'Ultra low-friction calorie tracking',
  headline: 'Track in seconds. Calibrate over time.',
  subtext:
    'Caligo keeps calorie logging frictionless and adjusts targets based on your weight trends, so you can focus on habits instead of perfect entries.',
  qualifier: 'Built for people who hate traditional calorie trackers.'
} as const;

export const howItWorks = {
  eyebrow: 'How it works',
  title: 'Calories first. Everything else optional.',
  lead: 'Designed for steady habits, not all-day logging.',
  steps: [
    {
      title: 'Swipe to log intake or exercise',
      body: 'Log the calories of a meal or workout in a few seconds, then carry on with your day.',
      icon: 'arrow-down-up'
    },
    {
      title: 'Weigh in when you can',
      body: 'Add your weight in a few seconds. Regular weigh-ins give Caligo the signal it needs to set your target.',
      icon: 'scale'
    },
    {
      title: 'Auto-calibration adapts to you',
      body: 'After an initial calibration phase, your calorie target adapts to your weight trend, not single-day noise.',
      icon: 'line-chart'
    }
  ]
} as const;

export const whyItWorks = {
  eyebrow: 'Why it works',
  title: 'Calories aren’t as exact as they look.',
  lead: 'Food labels are estimates, and real-world results vary by person. Caligo uses your weight trend to calibrate targets to what actually works for you.',
  kicker: 'Caligo adapts to you—not the other way around.'
} as const;

export const featuresSection = {
  eyebrow: 'Why it\'s different',
  title: 'Simple on the surface, smart underneath',
  lead: 'Caligo keeps the interface light while adapting your targets from real trend behavior.'
} as const;

export const features = [
  {
    title: 'Low-friction logging',
    body: 'Swipe-first logging makes consistency feel effortless.',
    icon: 'zap'
  },
  {
    title: 'Trend-based calibration',
    body: 'Targets follow your weight trend, so you don’t need per-meal perfection to stay on track.',
    icon: 'trending-up'
  },
  {
    title: 'Minimalist by default',
    body: 'No clutter. No nags. Just what you need to make the next small decision.',
    icon: 'layout-dashboard'
  },
  {
    title: 'On-device by default',
    body: 'Everything is stored on-device by default. We collect limited anonymized analytics to improve the app (which you can opt out of). We will never sell your data.',
    icon: 'lock'
  }
] as const;

export const trustNotes = {
  eyebrow: 'Trust and safety',
  title: 'Built with safety in mind',
  lead: 'Caligo supports long-term health habits with neutral language and clear boundaries.',
  points: [
    {
      text: 'Caligo is informational only and not medical advice.',
      icon: 'info'
    },
    {
      text: 'The app is not designed for diagnosing, treating, or preventing disease.',
      icon: 'shield-alert'
    },
    {
      text: 'If food or body tracking feels distressing, pause and seek professional support.',
      icon: 'heart'
    }
  ],
  resourceLabel: 'National Eating Disorders Association (NEDA)',
  resourceHref: 'https://www.nationaleatingdisorders.org/get-help/'
} as const;

export const screenshotsSection = {
  eyebrow: 'Screenshots',
  title: 'A calm interface for daily consistency',
  lead: 'Caligo is designed to stay calm and neutral — here’s what that looks like in the app.'
} as const;

export const screenshotCards = [
  {
    src: '/screenshots/screen-1.svg',
    alt: 'Placeholder Caligo home swipe logger',
    caption: 'Swipe logger'
  },
  {
    src: '/screenshots/screen-2.svg',
    alt: 'Placeholder Caligo dial weight entry screen',
    caption: 'Weight dial'
  },
  {
    src: '/screenshots/screen-3.svg',
    alt: 'Placeholder Caligo trend calibration graph',
    caption: 'Trend graph'
  },
  {
    src: '/screenshots/screen-4.svg',
    alt: 'Placeholder Caligo daily summary sheet',
    caption: 'Daily summary'
  },
  {
    src: '/screenshots/screen-5.svg',
    alt: 'Placeholder Caligo quick add panel',
    caption: 'Quick add'
  }
] as const;

export const testimonialsSection = {
  eyebrow: 'Testimonials',
  title: 'Early feedback from routine-focused testers',
  lead: 'Placeholder quotes for launch. Replace with verified customer testimonials before production.'
} as const;

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

export const faqSection = {
  eyebrow: 'FAQ',
  title: 'Common questions',
  lead: 'Short answers today, deeper docs as the app launches.'
} as const;

export const faqItems: FaqItem[] = [
  {
    question: 'Is it accurate?',
    answer:
      'Caligo isn’t trying to be perfect meal-by-meal. It’s designed to be directionally right and consistent, then use your weight trend to “pull” your targets toward reality over time. If your estimates are a bit off but you log the same way each day, it can still work well.'
  },
  {
    question: 'What if I don’t know exact calories?',
    answer:
      'You can still use it with rough estimates. Think “400-ish” not “427.” If you genuinely have no idea how many calories foods typically have, you’ll probably want a database-style tracker first. Caligo is best once you’ve got basic intuition.'
  },
  {
    question: 'What is calibration?',
    answer:
      'It’s the first couple of weeks where Caligo watches your logging + weigh-ins to learn your baseline and how you tend to estimate. After that, your target adjusts based on trend, not day-to-day noise.'
  },
  {
    question: 'Do I need to log every day?',
    answer:
      'Most days helps. Missing a day won’t break anything, consistency over weeks matters more than perfect streaks. Same idea for weigh-ins: regular beats flawless.'
  },
  {
    question: 'Does it track macros?',
    answer:
      'Not as the main experience. Caligo tracks calories + activity + weight trend first.'
  },
  {
    question: 'Does it support bulking?',
    answer:
      'Yes, as a controlled gain target. Caligo helps keep your rate of gain steady. For a ‘lean bulk’, sufficient training and protein intake still matter.'
  },
  {
    question: 'Is my data private?',
    answer:
      'Your waitlist email is used only for early access updates. Data lives on the device, and we only collect anonymized analytics to improve the app (which you can opt out of). We will never sell your data.'
  },
  {
    question: 'Is this medical or coaching advice?',
    answer:
      'No. It’s a self-tracking tool. If tracking starts to feel obsessive or distressing, pause and get support.'
  }
];

export const waitlistCopy = {
  eyebrow: 'Stay in the loop',
  title: 'Start Tracking',
  lead: 'Get an instant invite to the TestFlight beta',
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  cta: 'Send Invite',
  privacyNote: 'By submitting, you agree to our '
} as const;

export const contactCopy = {
  metaDescription: 'Contact Caligo.',
  hero: {
    eyebrow: 'Contact',
    title: 'Let us know what you need',
    leadPrefix: '',
    leadSuffix: ''
  },
  form: {
    title: 'Send a message',
    lead: 'I read every message, and I\'ll get back to you as soon as possible.',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    topicLabel: 'What’s this about?',
    topicOptions: [
      { value: 'support', label: 'Support' },
      { value: 'bug', label: 'Bug report' },
      { value: 'feature_request', label: 'Feature request' },
      { value: 'testflight', label: 'TestFlight' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'other', label: 'Other' }
    ],
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us what you are looking for.',
    cta: 'Send message'
  }
} as const;

export const footerCopy = {
  socialLinks: [
    { label: 'X', href: 'https://x.com/caligotracker' },
    { label: 'Instagram', href: 'https://instagram.com/caligotracker' },
    { label: 'TikTok', href: 'https://tiktok.com/@caligotracker' },
    { label: 'GitHub', href: 'https://github.com/nikhil1231/caligo-landing' }
  ],
  legalNotice: 'Caligo is not intended for medical diagnosis or treatment.'
} as const;
