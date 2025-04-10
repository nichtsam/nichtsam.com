export const profile = {
	bio:
		"👋 Hi, I'm Samuel\n" +
		'\n' +
		"I'm half German, half Polish, and grew up in Taiwan.\n" +
		"I'm a software developer with a generalist mindset.",
	questions: [
		{
			q: "What's your daily life like?",
			a: "I don't really have a fixed routine. I usually start by checking emails and catching up on newsletters to stay up to date. Then I get into whatever I need to do — or just whatever I feel like. When something catches my interest, I dive in with focus and curiosity. Outside of that, I spend time studying and working on personal growth. I also veg out quite a bit. 🙈",
			tags: ['life'],
		},
		{
			q: 'What languages do you speak?',
			a: "Chinese is my native language. I'm fluent in English — I read, write, and listen to it daily, though I only speak it occasionally. I'm also fluent in everyday German, since we spoke it at home growing up, but I'm still working on the more formal aspects. On the side, I've been learning French for a while now.",
			tags: ['life', 'language'],
		},
		{
			q: 'How do you communicate with people?',
			a: "I stay open-minded and I never assume that I'm right. I make sure to doubt myself reasonably. I focus on truly listening to people, to understand the meaning behind their words, since we often have different premises that we don’t realize. I try to put myself in others’ shoes because perspective matters. I adjust my communication style depending on the person, striving to find the best way to exchange ideas and mindsets.",
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
			a: 'With AI models being so powerful nowadays, I use them for early-stage learning. I also read documentation and quality resources on topics I want to dive into. Once I’ve built a good understanding, I find that building real projects and solving actual problems is the most effective way to improve. I’ve learned more from creating things I’m passionate about than from projects made solely for learning. Additionally, reviewing other codebases is helpful for understanding how others approach and solve problems.',
			tags: ['mindset', 'learn', 'tech', 'programming'],
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
