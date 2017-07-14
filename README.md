# \<gif-player\>

Control your animated GIFs

## Summary

Who doesn't like animated GIFs?

Inspired by [x-gif](http://geelen.github.io/x-gif/) but designed to work with the latest WebComponents v1 spec and (hopefully) fixes some issues with playback.

I'm using animated gifs to store the progress on a cross-stitching app (yeah, really) and they work great ... but (always a but). I really want to show the _last_ frame and let people play backwards and quickly scan through to show progress. I'd seen x-gif before but it just wasn't right for what I needed so I created this.

It's not finished yet but it works pretty well. Here are things I'm thinking should be added:

## TODOs

Playback control:
- Automatic on load
- On mouse-over
- Hold to play
- Click to start / stop etc...

Use better rAF for rendering / timing.

Offload work to service workers.

Fade-in images after loading and fade between frames to make display smoother.

Use IntersectionObserver to prevent playback while not on screen and also potentially unload some frames to reduce memory use.

Use streaming API to decode gif file as it loads so first frame can be displayed sooner.

Check disposal rules to determine exactly when retaining previous frame is required.