import { intersection } from 'ramda'
import { useMemo, useState } from 'react'
import { type MetaArgs } from 'react-router'
import { Badge } from '#app/components/ui/badge.tsx'
import { allQuestionTags, profile } from '#app/config/profile.ts'
import { pipeHeaders } from '#app/utils/headers.server.ts'
import { buildMeta } from '#app/utils/meta.ts'
import { type Route } from './+types/about'

export const meta: Route.MetaFunction = (args) =>
	buildMeta({
		args: args as unknown as MetaArgs,
		meta: {
			title: 'About | nichtsam',
			description:
				'Here are some questions and answers about Samuel. Read through to get to know him a bit better.',
		},
	})

export const headers: Route.HeadersFunction = (args) => {
	args.loaderHeaders.set('Cache-Control', 'max-age=86400')
	return pipeHeaders(args)
}

function useTagSelect() {
	const [selectedTagSet, setSelectedTagSet] = useState<Set<string> | null>(null)
	const selectedTags = useMemo(
		() => Array.from(selectedTagSet?.keys() ?? []),
		[selectedTagSet],
	)

	const isTagSelected = (tag: string) => !!selectedTagSet?.has(tag)

	const toggleTag = (tag: string) => {
		if (selectedTagSet?.has(tag)) {
			setSelectedTagSet((tagSet) => {
				const newSet = new Set(tagSet)
				newSet.delete(tag)
				return newSet
			})
		} else {
			setSelectedTagSet((tagSet) => {
				return new Set(tagSet).add(tag)
			})
		}
	}

	const clearTags = () => {
		setSelectedTagSet(null)
	}

	return {
		selectedTags,
		isTagSelected,
		toggleTag,
		clearTags,
	}
}

export default function About() {
	const { selectedTags, isTagSelected, toggleTag, clearTags } = useTagSelect()
	const allTags = allQuestionTags

	const filteredQuestions = useMemo(
		() =>
			selectedTags.length === 0
				? profile.questions
				: profile.questions.filter(
						(q) => intersection(q.tags, selectedTags).length,
					),
		[selectedTags],
	)

	return (
		<section className="container max-w-[80ch]">
			<p className="mb-12 whitespace-pre-line text-lg font-semibold">
				{profile.bio}
			</p>

			<div className="mb-12 flex flex-col gap-4">
				<p className="text-2xl font-semibold">Filter by tags</p>

				<ul className="flex flex-wrap gap-2">
					<Badge
						variant={selectedTags.length === 0 ? 'default' : 'outline'}
						className="cursor-pointer"
						onClick={clearTags}
					>
						All
					</Badge>
					{allTags.map((tag) => (
						<Badge
							key={tag}
							variant={isTagSelected(tag) ? 'default' : 'outline'}
							className="cursor-pointer"
							onClick={() => toggleTag(tag)}
						>
							{tag}
						</Badge>
					))}
				</ul>
			</div>

			<ul className="flex max-w-prose flex-col gap-4">
				{filteredQuestions.map((question) => (
					<li key={question.q} className="border-b last:border-none">
						<article className="mb-4 rounded-md p-4 transition ease-out hover:scale-105">
							<h2 className="mb-2 text-2xl font-bold lg:text-3xl">
								{question.q}
							</h2>
							<div className="mb-4 flex flex-wrap gap-2">
								{question.tags.map((tag) => (
									<Badge key={tag} variant="secondary" className="text-xs">
										{tag}
									</Badge>
								))}
							</div>

							<p className="lg:text-lg">{question.a}</p>
						</article>
					</li>
				))}
			</ul>
		</section>
	)
}
