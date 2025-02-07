import { resourceSharingSecurity } from '@nichtsam/helmet/resourceSharing'
import { generateImage } from '#app/utils/image.server.tsx'
import { combineHeaders } from '#app/utils/request.server.ts'
import { ServerTiming } from '#app/utils/timings.server.ts'

export async function loader() {
	const timing = new ServerTiming()

	const jsx = (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100%',
				width: '100%',
			}}
		>
			<h1 style={{ fontSize: 160, fontWeight: 'bold' }}>Error</h1>
		</div>
	)

	const data = await generateImage({ jsx, timing })

	const cors = new Headers({
		'Access-Control-Allow-Origin': '*',
	})
	resourceSharingSecurity(cors, { strategy: 'cross-origin' })
	return new Response(data, {
		headers: combineHeaders(
			{
				'Content-Type': 'image/png',
				'Content-Length': Buffer.byteLength(data).toString(),
				'Cache-Control': 'public, max-age=86400, immutable',
				'Server-Timing': timing.toString(),
			},
			cors,
		),
	})
}
