# web-amr

AMR audio codec is an audio compression format optimized for speech coding. Since AMR is not a supported web audio format, this library provides an implementation of AMR for use in the web.

> Note: Currently this library only supports narrowband AMR.

## Installation

```sh
# Using npm
npm install web-amr

# Using yarn
yarn add web-amr

# Using pnpm
pnpm add web-amr
```

## Usage

```TypeScript
import { AMRPlayer } from "web-amr";

const player = AMRPlayer(buffer); // pass file as ArrayBuffer
```

If the buffer failed to be decoded, `player.error` will be set. You can check for `player.error?.message` before proceeding.

The returned `player` instance implements a subset of the [`HTMLMediaElement` API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement). Hence, you can use it as a drop-in for a real HTML5 audio player. It might be that this subset of APIs is all that you need from both; in that case, it's safe to do this:

```TypeScript
import type { Player } from "web-amr";

// assume we have isAMR, audioElement, file,
// and a function "read" that returns ArrayBuffer

if (!isAMR) audioElement.src = file;
else audioElement.remove();

const player: Player = isAMR ? AMRPlayer(read(file)) : audioElement;

// use player normally

player.play();
```

## Available methods

### `addEventListener`

Appends an event listener for events. The callback argument sets the callback that will be invoked when the event is dispatched.

### `removeEventListener`

Removes the event listener in target's event listener list with the same type and callback.

### `play: (): Promise<void>`

Loads and starts playback of the AMR audio.

### `pause: (): Promise<void>`

Pauses the current playback.

### `fastSeek: (seconds: number): Promise<void>`

Sets the current playback position, in seconds.

## Props

### `duration: number`

Returns the duration in seconds of the current media resource. A NaN value is returned if duration is not available.

### `currentTime: number`

Gets or sets the current playback position, in seconds.

### `readonly` `paused: boolean`

Gets a flag that specifies whether playback is paused.

### `readonly` `ended: boolean`

Gets information about whether the playback has ended or not.

### `readonly` `error: MediaError | null`

Returns an object representing the current error state of the audio.

## Contributing

Use `pnpm` as your package manager while installing dependencies. Make sure `pnpm build` runs without an error before raising a PR.

## Acknowledgement

This project uses an emscripten build of [OpenCORE-AMR](https://sourceforge.net/projects/opencore-amr/) from (yxl)[https://github.com/yxl/opencore-amr-js].
