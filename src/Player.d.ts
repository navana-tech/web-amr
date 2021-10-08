/**
 * Player is a subset of HTMLMediaElement API implemented by AMRPlayer
 */
export type Player = {
	/**
	 * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
	 */
	addEventListener: EventTarget["addEventListener"];

	/**
	 * Removes the event listener in target's event listener list with the same type, callback, and options.
	 */
	removeEventListener: EventTarget["removeEventListener"];

	/**
	 * Loads and starts playback of a media resource.
	 */
	play: () => Promise<void>;

	fastSeek: (ms: number) => Promise<void>;

	/**
	 * Pauses the current playback and sets paused to TRUE. This can be used to test whether the media is playing or paused. You can also use the pause or play events to tell whether the media is playing or not.
	 */
	pause: () => Promise<void>;

	/**
	 * Returns the duration in seconds of the current media resource. A NaN value is returned if duration is not available, or Infinity if the media resource is streaming.
	 */
	duration: number;

	/**
	 * Gets or sets the current playback position, in seconds.
	 */
	currentTime: number;

	/**
	 * Gets a flag that specifies whether playback is paused.
	 */
	readonly paused: boolean;

	/**
	 * Gets information about whether the playback has ended or not.
	 */
	readonly ended: boolean;

	/**
	 * Returns an object representing the current error state of the audio or video element.
	 */
	readonly error: MediaError | null;
};
