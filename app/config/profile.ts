import dedent from 'dedent'

export const profile = {
	bio: dedent`
👋 Hi, I'm Samuel — a software developer with a generalist mindset.

One key thing about me: I think in abstract, fluid ways. I don't default to concrete opinions or fixed stances because I see things as interconnected and often too complex to reduce to black-and-white.

I know many people expect clear-cut answers or confident takes, but I don't usually operate that way. I value my thinking style because it allows me to use my mental capacity more efficiently, reflect more deeply, and think more freely and innovatively.
`,
	questions: [
		{
			q: "What's your daily life like?",
			a: "I don't follow a strict routine. Most days start with checking emails and newsletters to stay in the loop, then I flow into whatever feels right — work, study, or exploration. When something grabs me, I dive in fully. I balance focus with plenty of downtime too. 🙈",
			tags: ['life'],
		},
		{
			q: 'What languages do you speak?',
			a: 'Chinese is my first language. I’m fluent in English — I read, write, and listen in it every day, just don’t speak it that often. We used German at home growing up, and I’m still brushing it up.',
			tags: ['life', 'language'],
		},
		{
			q: 'How do you communicate with people?',
			a: "I stay open-minded and I never assume that I'm right. I make sure to doubt myself reasonably. I focus on truly listening to people, to understand the meaning behind their words, since we often have different premises that we don\'t realize. I try to put myself in others\' shoes because perspective matters. I adjust my communication style depending on the person, striving to find the best way to exchange ideas and mindsets.",
			tags: ['life', 'language'],
		},
		{
			q: 'How do you approach a new concept?',
			a: "I believe in thorough thinking and paying attention to details. When approaching a new concept, I focus on understanding the fundamentals and breaking things down to their core. I make sure to grasp every aspect of the subject, or at least recognize what I don't fully understand. I find that this thoughtful, logical approach helps me master any new concept.",
			tags: ['mindset', 'learn'],
		},
		{
			q: 'How do you stay updated with the latest tech trends and tools?',
			a: "I work with tech daily, so I naturally stay up to date with whatever I'm working on. To stay informed more broadly, I read newsletters from various sources, like TLDR. I also use AI to simplify my reading process by summarizing articles first, and then diving deeper if I find them interesting or valuable.",
			tags: ['tech', 'learn'],
		},
		{
			q: 'What programming language and tools do you use?',
			a: "I primarily use TypeScript for my day-to-day work. For front-end development, I use React and React Router. For learning and side projects, I enjoy using Golang and Rust. Additionally, I use Dart and Flutter for mobile development. I'm interested in programming in general, so I like to try out various things and don't stick to just one!",
			tags: ['tech', 'programming'],
		},
		{
			q: "What's your favorite part about programming?",
			a: 'My favorite part about programming is the constant problem-solving and creativity it involves. Every challenge feels like a puzzle that can be approached in multiple ways, and the satisfaction of finding an elegant solution is what keeps me going. I enjoy streamlining complex problems into concise, intuitive, and fundamental solutions.',
			tags: ['tech', 'programming', 'mindset'],
		},
		{
			q: 'What do you do to improve your coding skills?',
			a: "With AI models being so powerful nowadays, I use them for early-stage learning. I also read documentation and quality resources on topics I want to dive into. Once I've built a good understanding, I find that building real projects and solving actual problems is the most effective way to improve. I've learned more from creating things I'm passionate about than from projects made solely for learning. Additionally, reviewing other codebases is helpful for understanding how others approach and solve problems.",
			tags: ['mindset', 'learn', 'tech', 'programming'],
		},
		{
			q: 'Do you struggle to make abstract thoughts concrete?',
			a: "Not really — though I tend to take my time. I enjoy both sides: staying abstract allows me to explore ideas freely and make broader connections, while concretizing helps me externalize those thoughts and create impact. I only pin things down when necessary, and when I do, I try to do it thoughtfully. Abstract ideas often lose depth during the concretization process, and I think it's a pity when the true meaning is lost during the process.",
			tags: ['mindset'],
		},
		{
			q: 'How do you approach decision-making?',
			a: "I like to think things through before making decisions, and I never insist that my thoughts are the right ones. Instead, I focus on understanding the pros and cons of different approaches and work with key stakeholders to reach a consensus. That said, I'm practical and balanced — when needed, I can rely on intuition and quick reasoning to make fast decisions.",
			tags: ['mindset'],
		},
		{
			q: 'How do you adapt to different rhythms or expectations?',
			a: "I'm pretty adaptable — it's one of my strengths. I don't attach myself to a fixed process, which helps me adjust efficiently to different situations. I prioritize tasks based on what's important at the time, so things get handled in a timely and reasonable way. While I enjoy going with the flow, I can shift my pace easily when I need to align with others or meet specific expectations.",
			tags: ['mindset'],
		},
	],
} satisfies Profile

export const allQuestionTags = Array.from(
	new Set(profile.questions.flatMap((q) => q.tags)),
)

type Profile = {
	bio: string
	questions: [Question, ...Question[]]
}
type Question = { q: string; a: string; tags: [string, ...string[]] }
