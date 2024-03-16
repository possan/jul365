# JUL 365

A hack from the Stockholm Stupid Hackathon 2024.

[View online](https://jul365.possan.codes/)

## Wat?

It plays a time stretched christmas song from christmas eve to christmas eve, meaning it has to slow it down more than 100.000 times for a regular 3 minute song to stretch over a year which is around 8760 hours.

## Why?

Yes.

## How?

A PureData patch is included that loads a wave file, uses a phase vocoder to time stretch the audio to any length then exports 365\*4 loopable audio files, the exporting needs to happen in real time so it takes forever...

Files are converted to mp3s and put on a CDN and looped in the web app just which picks which loops to play based on current date or a selection.
