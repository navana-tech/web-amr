import { AMR } from "./vendor/amrnb";
import type { Player } from "./Player";

const getAudioContext = () => {
	if (window.AudioContext) return new window.AudioContext();
	throw new Error("Your browser cannot play this audio.");
};

const LOADEDDATA = new Event("loadeddata");
const TIMEUPDATE = new Event("timeupdate");
const PLAYERENDED = new Event("playerended");

const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_NETWORK = 2;
const MEDIA_ERR_DECODE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

const decodeError = () =>
	Object.assign(new EventTarget(), {
		duration: 0,
		currentTime: 0,
		error: {
			message: "Could not decode AMR audio",
			code: MEDIA_ERR_DECODE,
			MEDIA_ERR_ABORTED,
			MEDIA_ERR_NETWORK,
			MEDIA_ERR_DECODE,
			MEDIA_ERR_SRC_NOT_SUPPORTED,
		},
		play() {
			throw new Error("Player has errored.");
		},
		pause() {
			throw new Error("Player has errored.");
		},
		fastSeek() {
			throw new Error("Player has errored.");
		},
		get paused() {
			return false;
		},
		get ended() {
			return false;
		},
	});

export const AMRPlayer = (
	file: ArrayBuffer,
	{ onEnd = () => {} }: { onEnd?: () => void } = {},
): Player => {
	const buf = new Uint8Array(file);

	const samples = AMR.decode(buf);
	if (!samples) return decodeError();

	const audioContext = getAudioContext();

	let notPlayed = true;

	let isPlaying = false;
	let isPaused = false;
	let bufferSource: AudioBufferSourceNode & { theEnd: Promise<void> };
	// in milliseconds
	let startedAt: number | null = null;
	// in milliseconds
	let pauseOffset: number = 0;

	const resetTimers = () => {
		startedAt = null;
		pauseOffset = 0;
	};

	const events = new EventTarget();
	const addEventListener = events.addEventListener.bind(events);
	const removeEventListener = events.removeEventListener.bind(events);

	const createBufferSource = (startFrom: number = 0) => {
		// 8000 samples/second = 8 samples/millisecond
		let offset = startFrom * 8;

		const samplesLen = samples.length;

		// avoid error when seeked to end and no samples left to play
		if (offset >= samplesLen) offset = samplesLen - 8000;

		bufferSource = Object.assign(audioContext.createBufferSource(), {
			theEnd: Promise.resolve(),
		});
		const buffer = audioContext.createBuffer(1, samplesLen - offset, 8000);

		buffer.copyToChannel(samples.slice(offset), 0, 0);

		const stop = bufferSource.stop.bind(bufferSource);

		bufferSource.stop = () => {
			try {
				stop();
			} catch (e) {
				// if source is already ended, make stop no-op
				events.dispatchEvent(PLAYERENDED);
			}
		};

		bufferSource.buffer = buffer;
		bufferSource.connect(audioContext.destination);

		bufferSource.theEnd = new Promise<void>(resolve => {
			bufferSource.onended = () => {
				isPlaying = false;
				if (!isPaused) {
					resetTimers();
					createBufferSource();

					resolve();

					events.dispatchEvent(PLAYERENDED);

					return onEnd();
				} else return resolve();
			};
		});
	};

	createBufferSource();

	// get only on initialisation
	const duration = bufferSource!.buffer!.duration;

	// all methods made async to match native audioElement methods
	const play = async () => {
		if (isPlaying || !bufferSource) return;
		if (pauseOffset >= duration * 1000) return stop();

		startedAt = performance.now() - pauseOffset;
		bufferSource.start();
		isPlaying = true;
		isPaused = false;
		notPlayed = false;
	};

	const pause = async () => {
		if (isPlaying && startedAt) {
			const current = performance.now();
			pauseOffset = current - startedAt;
			bufferSource.stop();
			const theEnd = bufferSource.theEnd;
			createBufferSource(pauseOffset);
			isPaused = true;
			await theEnd;
		}

		events.dispatchEvent(TIMEUPDATE);
	};

	const seek = async (ms: number) => {
		isPaused = true;

		if (isPlaying) {
			bufferSource.stop();
			const theEnd = bufferSource.theEnd;
			createBufferSource(ms);
			pauseOffset = ms;
			await theEnd;
			play();
		} else {
			createBufferSource(ms);
			pauseOffset = ms;
		}

		events.dispatchEvent(TIMEUPDATE);
	};

	const stop = async () => {
		if (!bufferSource) return;
		resetTimers();
		bufferSource.stop();
		const theEnd = bufferSource.theEnd;
		createBufferSource();
		isPaused = false;
		await theEnd;
	};

	// const toggle = () => (isPlaying ? pause() : play());

	setInterval(() => {
		if (isPlaying) {
			events.dispatchEvent(TIMEUPDATE);
		}
	}, 150);

	setTimeout(() => events.dispatchEvent(LOADEDDATA), 100);

	return {
		addEventListener,
		removeEventListener,

		play,
		pause,
		fastSeek(seconds) {
			return seek(seconds * 1000);
		},

		/* these methods don't exist on HTMLMediaElement,
		 * and are omitted for conformance; however
		 * if need arises, we could enable them
		 */

		// stop,
		// toggle,

		duration,

		get paused() {
			return !isPlaying;
		},

		get ended() {
			/* Player has been played at least once,
			 * is not currently playing,
			 * and timer has been reset to 0
			 */
			return !notPlayed && !isPlaying && pauseOffset === 0;
		},

		get currentTime() {
			if (isPlaying) return (performance.now() - startedAt!) / 1000;
			if (isPaused) return pauseOffset / 1000;
			// must have been stopped
			return 0;
		},
		set currentTime(seconds) {
			seek(seconds * 1000);
		},

		error: null,
	};
};
