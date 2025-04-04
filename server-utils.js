import { format } from 'node:url'
import { styleText } from 'node:util'
import * as address from 'address'

const printUrls = (port) => {
	const { localUrl, lanUrl } = getUrls(port)

	console.log(
		`${styleText('bold', 'Local:'.padEnd(18))}${styleText('cyan', localUrl)}`,
	)
	if (lanUrl) {
		console.log(
			`${styleText('bold', 'On Your Network:'.padEnd(18))}${styleText('cyan', lanUrl)}`,
		)
	}
}

const getUrls = (port) => {
	const urls = {}

	urls.localUrl = formatUrl({ hostname: 'localhost', port })

	const localIp = address.ip()
	if (localIp && isPrivateIp(localIp)) {
		urls.lanUrl = formatUrl({ hostname: localIp, port })
	}

	return urls
}

const formatUrl = ({ protocol = 'http', hostname, port, pathname, ...rest }) =>
	format({
		protocol,
		hostname,
		port,
		pathname,
		...rest,
	})

const isPrivateIp = (ip) => {
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	return /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(ip)
}

export { printUrls }
