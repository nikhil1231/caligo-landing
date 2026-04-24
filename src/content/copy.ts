import { CONTACT_EMAIL } from '../lib/site';

export interface Testimonial {
  quote: string;
  author: string;
  detail: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LegalSection {
  title: string;
  type: 'text' | 'list' | 'html';
  content?: string;
  items?: string[];
}

export const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' }
] as const;

export const heroCopy = {
  eyebrow: 'Ultra low-friction calorie tracking',
  headline: 'Caligo is the calorie tracker you’ll actually stick to.',
  subtext:
    'Caligo keeps calorie logging frictionless and adjusts targets based on your weight trends, so you can focus on habits instead of perfect entries.',
  qualifier: 'Built for people who are sick of calorie trackers.'
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
  kicker: 'Caligo adapts to you, not the other way around.'
} as const;

export const featuresSection = {
  eyebrow: 'Why it\'s different',
  title: 'Simple on the surface, smart underneath',
  lead: 'Caligo keeps the interface light while adapting your targets from real trend behavior.'
} as const;

export const whyIMadeCaligoSection = {
  eyebrow: 'Why I made Caligo',
  title: 'Built from my own frustration with tracking apps',
  paragraphs: [
    'I\'ve started countless diets over the years, and I was just fed up with having to use calorie tracking apps.',
    'I felt myself obsessing over every calorie and macro. I was bombarded with ads and premium upsells. My own data was hidden behind a paywall.',
    'My first successful long-term diet was when I didn\'t even use an app: I just kept a rough running total of calories in my head. That was the inspiration behind Caligo.',
    'I built it to be as frictionless as possible to use. I wanted to be able to track with a single gesture.'
  ],
  imageSrc: '/self_tracking.png',
  imageAlt: 'Me tracking my calories'
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
  lead: 'Caligo is designed to stay minimal and neutral.'
} as const;

export const screenshotCards = [
  {
    alt: 'Caligo home swipe logger',
    caption: 'Logging food'
  },
  {
    alt: 'Caligo dial weight entry screen',
    caption: 'Logging exercise'
  },
  {
    alt: 'Caligo trend calibration graph',
    caption: 'Dashboard'
  },
  {
    alt: 'Caligo daily summary sheet',
    caption: 'Weight'
  },
  {
    alt: 'Caligo quick add panel',
    caption: 'Settings'
  },
  {
    alt: 'Caligo quick add panel',
    caption: 'Entries'
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
  lead: `If you have any other questions, feel free to reach out to us at <a class="font-semibold text-accent hover:text-sky-500" href="mailto:${CONTACT_EMAIL}" data-analytics-event="cta_click" data-analytics-target="contact_email" data-analytics-label="faq_email" data-analytics-location="faq">${CONTACT_EMAIL}</a>.`
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
      'Not currently. We might add it in a future update if there is demand for it!'
  },
  {
    question: 'Does it support bulking?',
    answer:
      'Yes, as a controlled gain target. Caligo helps keep your rate of gain steady. For a ‘lean bulk’, sufficient training and protein intake still matter.'
  },
  {
    question: 'Is my data private?',
    answer:
      'Data lives on the device, and we only collect anonymized analytics to improve the app (which you can opt out of). If you sign up for the beta, your email is used only for early access updates. We will never sell your data.'
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
  legalNotice: 'Caligo is not intended for medical diagnosis or treatment.',
  disclosure: 'We use analytics tools, including Microsoft Clarity, to understand how people use this site and improve the experience.'
} as const;

export const privacyCopy = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Caligo. Learn what we collect, why we collect it, and how we protect your data.',
  updatedAt: 'March 14, 2026',
  intro:
    'This Privacy Policy explains how Caligo collects, uses, and protects information. This document may change as the app evolves.',
  sections: [
    {
      title: 'What we collect',
      type: 'list',
      items: [
        'We may collect your email address if you join the beta/waitlist or contact us.',
        'We may also collect limited usage data from the website or app, such as page views, clicks, device/browser information, and pseudonymous analytics identifiers, if analytics tools are enabled.',
        'At launch, calorie, weight, and exercise logs are stored locally on your device unless otherwise stated.'
      ]
    },
    {
      title: 'How we use data',
      type: 'list',
      items: [
        'To respond to beta/waitlist and contact requests.',
        'To improve app quality and usability.',
        'We will NEVER sell your data.'
      ]
    },
    {
      title: 'Data retention',
      type: 'text',
      content:
        'We keep your contact information only as long as needed for the stated purpose, typically until the product launch or until you request deletion.'
    },
    {
      title: 'Third parties',
      type: 'text',
      content:
        'We may use third-party service providers such as Google Firebase and Microsoft Clarity for analytics, diagnostics, and hosting-related functions. These providers may process pseudonymous usage data according to their own privacy terms.'
    },
    {
      title: 'Cookies and analytics',
      type: 'text',
      content:
        'We use analytics tools, including Microsoft Clarity and Google Firebase, to understand how people use this site and improve the experience. These tools use cookies or similar technologies to collect pseudonymous data about your interaction with our services.'
    },
    {
      title: 'Your rights and choices',
      type: 'html',
      content:
        'You can request access, correction, or deletion of your personal information (such as your email address) at any time by contacting <a class="font-semibold text-accent hover:text-sky-500" href="mailto:hello@caligotracker.app">hello@caligotracker.app</a>.'
    },
    {
      title: 'Age requirements',
      type: 'text',
      content:
        'Caligo is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.'
    },
    {
      title: 'Medical disclaimer',
      type: 'text',
      content:
        'Caligo is not for medical use and is not a substitute for professional healthcare advice, diagnosis, or treatment.'
    },
    {
      title: 'Data operator',
      type: 'text',
      content: 'Caligo is operated by Nikhil Kunde based in The United Kingdom.'
    },
    {
      title: 'Policy changes',
      type: 'text',
      content:
        'We may revise this policy from time to time. Material updates will be reflected by the "Last updated" date above.'
    }
  ] as LegalSection[]
} as const;

export const termsCopy = {
  title: 'Terms of Service',
  description: 'Terms of Service for Caligo.',
  updatedAt: 'March 14, 2026',
  intro:
    'These Terms govern your use of Caligo. By using the site or app, you agree to these Terms.',
  sections: [
    {
      title: 'Informational use only',
      type: 'text',
      content:
        'Caligo is provided for informational and self-tracking purposes only. It is not medical advice and should not be used for diagnosis or treatment.'
    },
    {
      title: 'User responsibility',
      type: 'text',
      content:
        'You are responsible for how you use the app, the data you enter, and decisions made from that information.'
    },
    {
      title: 'Acceptable use',
      type: 'text',
      content:
        'You agree not to misuse the service, disrupt access, attempt unauthorized access, or use the product for unlawful purposes.'
    },
    {
      title: 'Liability limitations',
      type: 'text',
      content:
        'To the fullest extent permitted by law, Caligo is provided "as is" without warranties. We are not liable for indirect or consequential damages related to use of the service.'
    },
    {
      title: 'Termination',
      type: 'text',
      content:
        'We may suspend or terminate access if these Terms are violated or if the service is discontinued.'
    },
    {
      title: 'Contact',
      type: 'html',
      content:
        'Questions about these Terms can be sent to <a class="font-semibold text-accent hover:text-sky-500" href="mailto:hello@caligotracker.app">hello@caligotracker.app</a>.'
    },
    {
      title: 'Governing Law',
      type: 'text',
      content:
        'These Terms are governed by and construed in accordance with the laws of The United Kingdom, without regard to its conflict of law principles.'
    },
    {
      title: 'Changes to terms',
      type: 'text',
      content:
        'These Terms may change over time. Continued use after updates means you accept the revised Terms.'
    }
  ] as LegalSection[]
} as const;
