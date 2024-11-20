// since the dev server re-requires the bundle, do some shenanigans to make certain things persist across that 😆
// - Borrowed from https://github.com/jenseng/abuse-the-platform/blob/2993a7e846c95ace693ce61626fa072174c8d9c7/app/utils/singleton.ts
// - Modified by https://github.com/kentcdodds/kentcdodds.com/blob/main/app/utils/singleton.server.ts

// If this seems to be not working properly, it might be that the dev server isn't sustaining the `global` variable.
export function singleton<Value>(name: string, value: () => Value): Value {
	const yolo = global as any
	yolo.__singletons ??= {}
	yolo.__singletons[name] ??= value()
	return yolo.__singletons[name]
}
