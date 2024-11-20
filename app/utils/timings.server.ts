import chalk from 'chalk'

type Metric = {
	name: string
	start: number
	dur?: number
	desc?: string
}

export class ServerTiming {
	metrics: Map<string, Metric> = new Map()

	time(name: string, desc?: string) {
		if (this.metrics.has(name)) {
			console.warn(
				chalk.hex('#FFA500')(`Server Timing Timer '${name}' already exists`),
			)
			return
		}
		const now = performance.now()
		this.metrics.set(name, {
			name,
			start: now,
			desc,
		})
	}
	timeEnd(name: string) {
		const now = performance.now()
		const metric = this.metrics.get(name)
		if (!metric) {
			console.warn(
				chalk.hex('#FFA500')(`Server Timing Timer '${name}' does not exist`),
			)
			return
		}

		metric.dur = now - metric.start
	}

	toString(): string {
		return Array.from(this.metrics.values())
			.filter((m) => {
				if (m.dur === undefined) {
					console.warn(
						chalk.hex('#FFA500')(
							`Server Timing Timer '${m.name}' is not finish`,
						),
					)

					return false
				}

				return true
			})
			.map((m) =>
				[
					m.name.replaceAll(/(;|,| |=|@|:)/g, '_'),
					m.desc ? `desc=${JSON.stringify(m.desc)}` : null,
					`dur=${m.dur!}`,
				]
					.filter(Boolean)
					.join(';'),
			)
			.join(',')
	}
}
