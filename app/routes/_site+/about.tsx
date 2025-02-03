import { Fragment } from 'react/jsx-runtime'
import { type MetaArgs } from 'react-router'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/about'

export const meta: Route.MetaFunction = (args) =>
	buildMeta(args as unknown as MetaArgs, {
		title: 'About | nichtsam',
		description:
			'Here are some questions and answers about Samuel. Read through to get to know him a bit better.',
	})

export const headers: Route.HeadersFunction = (args) => {
	args.loaderHeaders.set('Cache-Control', 'max-age=86400')
	return pipeHeaders(args)
}

export default function About() {
	return (
		<section className="container py-9">
			<article className="prose dark:prose-invert lg:prose-xl">
				{questions.map(({ q, a }) => (
					<Fragment key={q}>
						<h2>{q}</h2>
						<p>{a}</p>
					</Fragment>
				))}
			</article>
		</section>
	)
}

const questions = [
	{
		q: 'A tiny bit about me?',
		a: "Hi, I’m Samuel Jensen. I'm half German and half Polish, and I was raised in Taiwan.",
	},

	{
		q: "What's my daily life like?",
		a: 'Well, I don’t have a fixed routine. Most of the time, I take things easy and simply enjoy life. When something catches my interest, I dive deep into it with focus and curiosity. Aside from that, I spend time studying and working on my personal growth.',
	},

	{
		q: 'What programming language and tools do you use?',
		a: 'I primarily use TypeScript for my day-to-day work, especially in front-end development. Remix is my go-to front-end framework. For learning and side projects, I use both Golang and Rust, with Golang being more suited for everyday use due to its simplicity, while I explore Rust for its challenges and learning opportunities.',
	},

	{
		q: "What's your favorite part about programming?",
		a: 'My favorite part about programming is the constant problem-solving and creativity it involves. Every challenge feels like a puzzle that can be approached in multiple ways, and the satisfaction of finding an elegant solution is what keeps me going. I love streamlining thought processes into the most concise, intuitive, and fundamental solution.',
	},

	{
		q: 'What languages do you speak?',
		a: 'I would say that Chinese is my native language. I’m fluent in English, as I read, write, and listen to it daily, though I speak it occasionally. I’m conversational in German, as we spoke it at home growing up. In addition, I’ve also been learning French on the side for a while now.',
	},

	{
		q: 'What am I doing lately?',
		a: 'I’m casually learning French and German to improve my language skills. I’ve also been doing Leetcode challenges to sharpen my knowledge of data structures and algorithms, mainly in Golang. Additionally, I’m learning how interpreters work by building one in Golang, which has been a fascinating subject.',
	},

	{
		q: 'What do you want to achieve in the next few years?',
		a: 'I hope to return to university and gain a more professional perspective on things. I quit studying after one year in college because I didn’t have a clear goal at the time. However, after a few years of exploring different experiences, I realized how much I enjoy studying and the opportunities it can bring.',
	},
]
