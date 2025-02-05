import { Resvg } from '@resvg/resvg-js'
import { type JSX } from 'react'
import satori, { type SatoriOptions } from 'satori'
import { type ServerTiming } from './timings.server'

export async function generateImage({
	jsx,
	timing = { time() {}, timeEnd() {} } as unknown as ServerTiming,
}: {
	jsx: JSX.Element
	timing?: ServerTiming
}) {
	timing.time('jsx to svg')
	const svg = await satori(jsx, {
		width: 1200,
		height: 600,
		fonts: await getFonts(['Inter']),
	})
	timing.timeEnd('jsx to svg')

	timing.time('svg to png')
	const resvg = new Resvg(svg)
	const pngData = resvg.render()
	const png = pngData.asPng()
	timing.timeEnd('svg to png')

	return png
}

async function getFonts(...fontOptions: Parameters<typeof getFont>[]) {
	return Promise.all(fontOptions.map((fontOption) => getFont(...fontOption))).then(
		(fonts) => fonts.flat(),
	)
}

async function getFont(
	font: string,
	weights = [400, 500, 600, 700],
	text = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\!@#$%^&*()_+-=<>?[]{}|;:,.`\'’"–—',
) {
	const css = await fetch(
		`https://fonts.googleapis.com/css2?family=${font}:wght@${weights.join(
			';',
		)}&text=${encodeURIComponent(text)}`,
		{
			headers: {
				// Make sure it returns TTF.
				'User-Agent':
					'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
			},
		},
	).then((response) => response.text())

	const resource = css.matchAll(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/g,
	)

	return Promise.all(
		[...resource]
			.map((match) => match[1])
			.filter(Boolean)
			.map((url) => fetch(url).then((response) => response.arrayBuffer()))
			.map(async (buffer, i) => ({
				name: font,
				style: 'normal',
				weight: weights[i],
				data: await buffer,
			})),
	) as Promise<SatoriOptions['fonts']>
}
