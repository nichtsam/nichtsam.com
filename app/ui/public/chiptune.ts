let audio: AudioContext | undefined

function context() {
	audio ??= new AudioContext()
	return audio
}

const NOTE: Record<string, number> = {
	C4: 261.63,
	D4: 293.66,
	E4: 329.63,
	F4: 349.23,
	G4: 392.0,
	A4: 440.0,
	B4: 493.88,
	C5: 523.25,
	D5: 587.33,
	E5: 659.25,
	G5: 783.99,
}

// [note, beats]; `-` is a rest.
const JINGLE: Array<[string, number]> = [
	['C5', 1],
	['E5', 1],
	['G5', 1],
	['E5', 1],
	['D5', 1],
	['-', 1],
	['G4', 1],
	['A4', 1],
	['C5', 2],
	['B4', 1],
	['G4', 1],
	['A4', 1],
	['E4', 1],
	['G4', 1],
	['C5', 3],
]

const BASS: Array<[string, number]> = [
	['C4', 4],
	['G4', 4],
	['A4', 4],
	['F4', 2],
	['G4', 2],
	['C4', 4],
]

function schedule(
	ctx: AudioContext,
	notes: Array<[string, number]>,
	start: number,
	beat: number,
	type: OscillatorType,
	gainValue: number,
	octave = 1,
) {
	let time = start
	for (let [name, beats] of notes) {
		let duration = beats * beat
		let freq = NOTE[name]
		if (freq) {
			let osc = ctx.createOscillator()
			let gain = ctx.createGain()
			osc.type = type
			osc.frequency.value = freq * octave
			gain.gain.setValueAtTime(gainValue, time)
			gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.95)
			osc.connect(gain).connect(ctx.destination)
			osc.start(time)
			osc.stop(time + duration)
		}
		time += duration
	}
	return time - start
}

/** Plays a short square-wave jingle. Resolves with its duration in ms. */
export function playJingle(): number {
	let ctx = context()
	void ctx.resume()
	let beat = 0.14
	let start = ctx.currentTime + 0.05
	let length = schedule(ctx, JINGLE, start, beat, 'square', 0.05)
	schedule(ctx, BASS, start, beat, 'triangle', 0.08, 0.5)
	return length * 1000
}

export function blip(freq = 880, duration = 0.05) {
	let ctx = context()
	void ctx.resume()
	let osc = ctx.createOscillator()
	let gain = ctx.createGain()
	osc.type = 'square'
	osc.frequency.value = freq
	gain.gain.setValueAtTime(0.03, ctx.currentTime)
	gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
	osc.connect(gain).connect(ctx.destination)
	osc.start()
	osc.stop(ctx.currentTime + duration)
}
