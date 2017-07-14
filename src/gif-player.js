import { GifReader } from './omggif';

export default function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
  canvas {
    position: absolute;
  }

  @keyframes spinner {
    to {transform: rotate(360deg);}
  }

  .spinner:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    margin-left: -10px;
    border-radius: 50%;
    border-top: 2px solid #999;
    border-right: 2px solid transparent;
    animation: spinner .6s linear infinite;
  }
</style>
<canvas></canvas>
<div class="spinner"></spinner>
`;

  class GifPlayer extends HTMLElement {
    static get observedAttributes() {
      return [ 'src', 'frame', 'size', 'speed', 'play', 'swipe', 'repeat', 'bounce', 'direction' ];
    }

    constructor() {
      super();

      this._frames = [];
      this._delays = [];
      this._frame = 0;
      this._decoded = -1;
      this._rendered = -1;    // frame last rendered
      this._speed = 0.5;
      this._size = 'auto';
      this._swipe = true;
      this._repeat = true;
      this._bounce = false;
      this._prerender = false;
      this._direction = 1;
      this._onload = null;

      this.pausePlaybackBound = this.pausePlayback.bind(this);
      this.moveBound = this.move.bind(this);
      this.resumePlaybackBound = this.resumePlayback.bind(this);
      this.prerenderFramesBound = this.prerenderFrames.bind(this);
      this.playLoopBound = this.playLoop.bind(this);

      const shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(document.importNode(template.content, true));

      this._spinner = shadowRoot.querySelector('.spinner');
      this._canvas = shadowRoot.querySelector('canvas');
      this._ctx = this._canvas.getContext('2d');
    }

    connectedCallback() {
      this.style.display = 'inline-block';
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.style.cursor = 'col-resize';

      this.addEventListener('touchstart', this.pausePlaybackBound, false);
      this.addEventListener('touchmove', this.moveBound, false);
      this.addEventListener('touchend', this.resumePlaybackBound, false);

      this.addEventListener('mouseenter', this.pausePlaybackBound, false);
      this.addEventListener('mousemove', this.moveBound, false);
      this.addEventListener('mouseleave', this.resumePlaybackBound, false);
    }

    disconnectedCallback() {
      this.removeEventListener('touchstart', this.pausePlaybackBound, false);
      this.removeEventListener('touchmove', this.moveBound, false);
      this.removeEventListener('touchend', this.resumePlaybackBound, false);

      this.removeEventListener('mouseenter', this.pausePlaybackBound, false);
      this.removeEventListener('mousemove', this.moveBound, false);
      this.removeEventListener('mouseleave', this.resumePlaybackBound, false);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;
      this[name] = newValue;
    }

    _handleBoolean(name, val) {
      this['_' + name] = val = (val !== null && val !== undefined) ? true : false;
      if (val) {
        this.setAttribute(name, '');
      } else {
        this.removeAttribute(name);
      }
    }

    get src() { return this._src; }
    set src(val) {
      this._src = val;
      this.load(val);
    }

    get frame() { return this._frame; }
    set frame(val) {
      this._frame = parseInt(val);
      this.displayFrame(this._frames, this._frame)
    }

    get size() { return this._size; }
    set size(val) { this._size = val; }

    get speed() { return this._speed; }
    set speed(val) { this._speed = parseFloat(val); }

    get swipe() { return this._swipe; }
    set swipe(val) { this._swipe = val; }

    get play() { return this._play; }
    set play(val) { this._handleBoolean('play', val); }

    get repeat() { return this._repeat; }
    set repeat(val) { this._repeat = parseFloat(val); }

    get bounce() { return this._bounce; }
    set bounce(val) { this._handleBoolean('bounce', val); }

    get direction() { return this._direction; }
    set direction(val) { this._direction = parseInt(val); }

    get prerender() { return this._prerender; }
    set prerender(val) { this._prerender = val; }

    get onload() { return this._onload; }
    set onload(val) { this._onload = val; }

    move(e) {
      e.preventDefault();

      // calculate our relative horizontal position over the element
      // TODO: cache this, clear on scroll / resize etc...
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var position = x / rect.width;

      // ... and which frame should appear there
      this.frame = Math.round((this._frames.length - 1) * position);
    }

    load(src) {
      this.dispatchEvent(new CustomEvent('gif-loading', { bubbles: true, composed: true, detail: src }));
      this._spinner.style.display = 'block';
      this._frames = [];

      var options = {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      };

      fetch(src, options)
        .then(resp => resp.arrayBuffer())
        .then(buf => new Uint8Array(buf))
        .then(buf => new GifReader(buf))
        .then(gif => this.process(gif))
        .then(() => this._spinner.style.display = 'none');
    }

    process(gif) {
      this._gif = gif;

      // canvas drawing area always matches the gif size
      this._canvas.width = gif.width;
      this._canvas.height = gif.height;

      // but we can change the visual size and position ...
      var gifRatio = gif.width / gif.height;
      var eleRatio = this.clientWidth / this.clientHeight;

      this._canvas.style.top = 0;
      this._canvas.style.left = 0;

      switch (this._size) {
        case 'auto':
          this.style.width = gif.width + 'px';
          this.style.height = gif.height + 'px';
          break;
        case 'cover':
          var width, height;
          if (gifRatio > eleRatio) {
            // fit to height, overlap sides
            width = this.clientHeight * gifRatio;
            height = this.clientHeight;
            this._canvas.style.top = 0;
            this._canvas.style.left = -((width - this.clientWidth) / 2) + 'px';
          } else {
            // fit to width, overlap top
            width = this.clientWidth;
            height = this.clientWidth / gifRatio;
            this._canvas.style.top = -((height - this.clientHeight) / 2) + 'px';
            this._canvas.style.left = 0;
          }
          this._canvas.style.width = width + 'px';
          this._canvas.style.height = height + 'px';
          break;
        case 'contain':
          var width, height;
          if (gifRatio > eleRatio) {
            width = this.clientWidth;
            height = this.clientWidth / gifRatio;
            this._canvas.style.top = ((this.clientHeight - height) / 2) + 'px';
            this._canvas.style.left = 0;
          } else {
            width = this.clientHeight * gifRatio;
            height = this.clientHeight;
            this._canvas.style.top = 0;
            this._canvas.style.left = ((this.clientWidth - width) / 2) + 'px';
          }
          this._canvas.style.width = width + 'px';
          this._canvas.style.height = height + 'px';
          break;
        case 'stretch':
          this._canvas.style.width = '100%';
          this._canvas.style.height = '100%';
          break;
      }

      var count = gif.numFrames();

      this._decoded = -1;
      this._delays = new Array(count);
      this._frames = new Array(count);

      if (this._frame < 0) {
        this._frame = this._frames.length + this._frame;
      }

      var e = new CustomEvent('gif-loaded', { bubbles: true, composed: true, detail: gif });
      this.dispatchEvent(e);
      if (this._onload) {
        this._onload(e);
      }

      if (this._play) {
        this.start();
      } else {
        this.displayFrame(this._frames, this._frame)
      }

      if (this._prerender) {
        requestIdleCallback(this.prerenderFramesBound);
      }
    }

    start() {
      this.playing = true;
      this.playAnimation(this._frames, this._frame);
    }

    stop() {
      this.playing = false;
    }

    pausePlayback(e) {
      this.paused = true;
    }

    resumePlayback(e) {
      this.paused = false;
      if (this.playing) {
        this.playAnimation(this._frames, this._frame);
      }
    }

    playLoop(timestamp) {
      this.rafHandle = requestAnimationFrame(this.playLoopBound);

      if (this._rendered != this._frame) {
        if (this._frames[this._frame]) {
          this._rendered = this._frame;
          this._ctx.putImageData(this._frames[this._frame], 0, 0);
        }
      }
    }

    playAnimation(frames, frame) {
      if (frames.length === 0) return;

      this.renderFrame(frame);
      setTimeout(() => {
        if (this.paused) {
          return;
        }
        var frame = this.frame + this._direction;
        if (frame < 0) {
          if (this._bounce) {
            this._direction = 1;
            frame = 1;
          } else {
            frame = this._frames.length - 1;
          }
        } else if (frame >= this._frames.length) {
          if (this._bounce) {
            this._direction = -1;
            frame = this._frames.length - 2;
          } else {
            frame = 0;
          }
        }
        this.frame = frame;
        this.playAnimation(this._frames, this._frame);
      }, this._delays[frame] * (1 / this._speed));
    }

    next() {
      this.frame++;
      if (this.frame >= this._frames.length) {
        this.frame = 0;
      }
      this.render(this.frame);
    }

    displayFrame(frames, frame) {
      if (frames.length === 0) return;
      if (frame >= frames.length) frame = frames.length - 1;
      if (frame < 0) frame += frames.length;

      this.renderFrame(frame);

      if (this._rendered != frame) {
        requestAnimationFrame(() => {
          this._ctx.putImageData(this._frames[frame], 0, 0);
          this._rendered = frame;
          this.dispatchEvent(new CustomEvent('gif-frame', { bubbles: true, composed: true, detail: frame }));
        });
      }
    }

    renderFrame(frame) {
      while (this._decoded < frame) {
        var curr = this._decoded + 1;
        var frameInfo = this._gif.frameInfo(curr);
        var imageData = this._ctx.createImageData(this._gif.width, this._gif.height);
        if (curr > 0 && frameInfo.disposal < 2) {
          imageData.data.set(new Uint8ClampedArray(this._frames[curr - 1].data));
        }
        this._gif.decodeAndBlitFrameRGBA(curr, imageData.data);
        this._frames[curr] = imageData;
        this._delays[curr] = frameInfo.delay * 10;
        this._decoded = curr;
      }
    }

    // pre-emptively render remaining frames during any idle time
    // https://developers.google.com/web/updates/2015/08/using-requestidlecallback
    prerenderFrames(deadline) {
      while (deadline.timeRemaining() > 0 && this._decoded < this._frames.length - 1) {
        this.renderFrame(this._decoded + 1);
      }

      // if we ran out of time and still have work todo, schedule another idle callback
      if (this._decoded < this._frames.length - 1) {
        requestIdleCallback(this.prerenderBound);
      }
    }
  }

  window.customElements.define('gif-player', GifPlayer);
}
