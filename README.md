[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/captaincodeman/gif-player)

# \<gif-player\>

WebComponent to control Animated GIF playback and access individual frames.

[More demos](https://captaincodeman.github.io/gif-player/components/gif-player/demo/)

Move your mouse over the images ...
<!--
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-loader.js"></script>
    <link rel="import" href="gif-player.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<gif-player src="https://media.giphy.com/media/TN0GTccRi7Ixa/giphy.gif" speed="0.5" play></gif-player>
<gif-player src="https://media.giphy.com/media/nh5QMbO89SFTG/giphy.gif" size="contain" prerender style="width:300px;height:200px"></gif-player>
```

This was inspired by [x-gif](http://geelen.github.io/x-gif/) but designed to work with the latest WebComponents v1 spec and fix some issues with playback of certain gifs. It uses the excellent [GifReader from omggif](https://github.com/deanm/omggif) for decoding.

## Features:

* Pure v1 WebComponent, approximately 4.5Kb gzipped
* In-built (simple) loading spinner (because some GIFs are large)
* Auto-start playback on load or pause at any frame relative to the start or end
* Control playback speed relative to original GIF settings
* Control frame displayed by mouseover / touch (based on horizontal position across the image)
* Pre-render frames in idle time* (even if animation is not playing)

Due to the way animated gifs are encoded and rendered, it's not always possible to jump directly to a specific frame to display it - some of the image may be transparent and rely on pixels from previous frames to render correctly (called 'disposal' in the GIF spec). So if we want to render the _last_ frame in the image, we may need to render all the previous ones first. The pre-rendering option allows this to happen in browser idle-time so that they are ready in advance (but is configurable). Frames are always automatically rendered as they are required during playback or UI interaction but there may be a slight delay depending on the size and complexity of the GIF.

## Properties:

`src="url"` sets the source URL for the image, just like with the `<img>` element. DataURIs and regular URLs should work but the latter need to provide CORS headers if being used from a different domain. Imgur and Giphy both seem to work fine and are used in the demos.

`size="auto"` set to control the sizing. Options are `auto` (the control resizes to the size of the GIF image), `cover` or `contain` (as per `object-fit` or `background-size` CSS properties) or `stretch` to fill the control (may distort the GIF). The control must be explicitly sized for any option other than `auto`.

`frame="0"` set the frame to display relative to the start of the animation, use negative numbers to make the frame relative to the end, so `frame="-1"` would display the _last_ frame.

`play` set to auto play the GIF on load

`speed="2"` set the playback speed relative to the original GIF encoding. A value of 0.5 would playback in slow-motion at half speed whereas 2 would double the speed for faster playback (will always depending on the performance capability of the client device).

`repeat` set to repeat playback on completion, otherwise stop

`bounce` set to reverse playback direction at the start or end of the animation rather than restarting.

`direction="1"` set the direction to play with 1 being forwards and -1 being reverse.

`prerender` set to use browser idle time to pre-render frames instead of rendering on demand.

Example, fit GIF in a 240 x 160 area, play it continually and reverse direction at either end:

```html
<gif-player src="my.gif" size="contain" play bounce style="width: 240px; height: 160px;"></gif-player>
```

## TODOs

It's not fully finished yet but it works pretty well for what I needed. Here are things I'm thinking should be added:

* Alternative playback control - play / pause button to start & stop (or hold to play)
* Use better rAF loop for rendering & timing of playback based on elapsed time.
* Offload decoding work to service workers / offscreen canvas.
* Fade-in images after loading and fade between frames to make display smoother.
* Use IntersectionObserver to prevent playback while not on screen and also potentially unload some frames to reduce memory use.
* Use streaming API to decode gif file as it loads so first frame can be displayed sooner.
* Check disposal rules to determine exactly when retaining previous frame is required.
* Make omggif a dependency and figure out how to make rollup remove the writer
* Use css for cover / contain settings