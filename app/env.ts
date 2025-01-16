import { type ServerBuild } from 'react-router'

declare module 'react-router' {
	// Your AppLoadContext used in v2
	interface AppLoadContext {
		serverBuild: Promise<ServerBuild>
	}
}

export {} // necessary for TS to treat this as a module
