/**
 * Static content for the landing page, kept separate from the page component so
 * the marketing copy is easy to edit and the page stays a thin composition.
 */

export interface HowItWorksStep {
  icon: string;
  title: string;
  body: string;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  /** Short "how to use it" hint. */
  how: string;
  /** Where in the app the feature lives. */
  where: string;
}

export interface FeatureGroup {
  phase: string;
  tagline: string;
  features: Feature[];
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    icon: '📊',
    title: 'Understand',
    body: 'Answer a few quick questions about how you travel, power your home, eat and shop.',
  },
  {
    icon: '🧭',
    title: 'Track',
    body: 'See your monthly footprint broken down by category and compared to real benchmarks.',
  },
  {
    icon: '🌱',
    title: 'Reduce',
    body: 'Get AI-personalized actions ranked by how much they actually save — for you.',
  },
];

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    phase: 'Measure',
    tagline: 'Turn your habits into a clear number.',
    features: [
      {
        icon: '📊',
        title: '4-step calculator',
        desc: 'A quick quiz across transport, home energy, food and lifestyle. Sensible defaults let you start in seconds.',
        how: 'Open the calculator and adjust each step to match your life.',
        where: 'Calculator',
      },
      {
        icon: '🌍',
        title: 'State-aware accuracy',
        desc: "Your electricity emissions use your state's real grid mix — coal-heavy vs hydro/renewable — so the number is realistic.",
        how: 'Pick your state in step 2 (Home energy).',
        where: 'Calculator → Home energy',
      },
      {
        icon: '📸',
        title: 'Scan your bill',
        desc: 'Snap a photo of your electricity bill and Gemini Vision reads the monthly kWh for you — no manual typing.',
        how: 'Tap “Scan your electricity bill” in step 2 and upload a photo.',
        where: 'Calculator → Home energy',
      },
    ],
  },
  {
    phase: 'Understand',
    tagline: 'See where it comes from — and ask why.',
    features: [
      {
        icon: '🧭',
        title: 'Visual dashboard',
        desc: 'An animated gauge, a donut breakdown by category, and comparisons to the India average and the climate-safe target.',
        how: 'Finish the calculator to land on your dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '🌱',
        title: 'AI insights',
        desc: 'A personalized coach reads your numbers and highlights the 3 highest-impact changes — ranked by what they save you.',
        how: 'Scroll to “Your personalized coach” on the dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '💬',
        title: 'Chat with your coach',
        desc: 'Ask anything (“how do I cut transport?”). Answers are grounded in your own footprint, not generic tips.',
        how: 'Tap the green chat bubble at the bottom-right — on any page.',
        where: 'Chat bubble (everywhere)',
      },
      {
        icon: '🍽️',
        title: 'Meal footprint scan',
        desc: 'Photograph a plate or grocery receipt and get an itemized food-carbon estimate.',
        how: 'Use “Estimate a meal” on the dashboard and upload a photo.',
        where: 'Dashboard',
      },
    ],
  },
  {
    phase: 'Reduce',
    tagline: 'Plan it, act on it, stick with it.',
    features: [
      {
        icon: '✅',
        title: 'Action tracker',
        desc: 'Tick changes you commit to and watch your projected footprint drop in real time.',
        how: 'Use “Track your actions” on the dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '🎚️',
        title: 'What-if simulator',
        desc: 'Slide through scenarios — EV, plant-based, rooftop solar, less flying — and see the combined impact instantly.',
        how: 'Open Simulate and move the sliders.',
        where: 'Simulate',
      },
      {
        icon: '🗓️',
        title: 'AI 30-day plan',
        desc: 'A week-by-week, personalized reduction roadmap with checkable tasks and a progress bar.',
        how: 'Open Plan — it generates from your data automatically.',
        where: 'Plan',
      },
      {
        icon: '📈',
        title: 'History, streaks & goals',
        desc: 'Log your footprint each month, keep a streak, set a target and track the trend.',
        how: 'Use “Your progress” on the dashboard; tap “Log this month”.',
        where: 'Dashboard',
      },
      {
        icon: '🏅',
        title: 'Achievements',
        desc: 'Unlock badges for streaks, goals, committed actions and low-carbon choices.',
        how: 'See “Achievements” on the dashboard — they unlock as you go.',
        where: 'Dashboard',
      },
      {
        icon: '📤',
        title: 'Share your card',
        desc: 'Download a branded footprint card (with a donut chart) or share it to inspire friends.',
        how: 'Use “Share my footprint” / “Download card” on the dashboard.',
        where: 'Dashboard',
      },
    ],
  },
];

export const HERO_SAMPLE = {
  total: 248,
  pct: 149,
  bars: [
    ['Transport', 110, 'bg-brand-700'],
    ['Home', 48, 'bg-brand-500'],
    ['Food', 60, 'bg-brand-400'],
    ['Lifestyle', 30, 'bg-brand-200'],
  ] as const,
};

export const WALKTHROUGH: ReadonlyArray<readonly [string, string]> = [
  ['Calculate', 'Take the 4-step quiz (or scan your bill) to get your number.'],
  ['Explore', 'Open your dashboard — gauge, donut breakdown and AI insights.'],
  ['Ask', 'Tap the chat bubble and ask your coach what to do first.'],
  ['Simulate', 'Try what-if scenarios to find the changes that suit you.'],
  ['Commit', 'Get your 30-day plan, track actions, build a streak.'],
];
