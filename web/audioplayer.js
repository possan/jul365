export class AudioPlayer {
  targetUrl;
  currentUrl;
  currentVolume;
  targetVolume;
  state;
  nextSource;
  nextGain;
  currentSource;
  currentGain;
  context;

  constructor() {
    this.state = "idle";
    this.targetUrl = "";
    this.currentUrl = "";
    this.currentVolume = 0;
    this.targetVolume = 0;
    this.currentSource = undefined;
    this.currentGain = undefined;
    this.nextSource = undefined;
    this.nextGain = undefined;
    this.context = undefined;
  }

  set(id, vol) {
    this.targetUrl = id;
    this.targetVolume = vol;
  }

  async _startloading() {
    if (this.targetUrl === "") {
      return;
    }

    this.state = "loading";
    let r = undefined;
    try {
      r = await fetch(this.targetUrl);
    } catch (e) {
      console.log("Failed to load file.", e);
      this.state = "idle";
      this.targetUrl = "";
      return;
    }

    if (!r.ok) {
      console.log("Failed to load file. (r.ok)");
      this.state = "idle";
      this.targetUrl = "";
      return;
    }

    let arrayBuffer = undefined;
    try {
      arrayBuffer = await r.arrayBuffer();
    } catch (e) {
      console.log("Failed to decode file.", e);
      this.state = "idle";
      this.targetUrl = "";
      return;
    }

    this.nextSource = this.context.createBufferSource();
    this.nextGain = this.context.createGain();

    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.nextSource.buffer = audioBuffer;
    this.nextSource.loop = true;
    this.nextSource.connect(this.nextGain);

    this.nextGain.connect(this.context.destination);
    this.nextGain.gain.value = 0.0;
    this.nextSource.start();

    this.state = "fadingout";
  }

  tick() {
    // console.log("tick", this.state, this.currentId, this.currentVolume);

    if (this.state === "idle") {
      this._startloading();
    } else if (this.state === "loading") {
      // do nothing
    } else if (this.state === "fadingout") {
      this.currentVolume = Math.max(0, this.currentVolume - 10);
      if (this.currentGain) {
        this.currentGain.volume = this.currentVolume / 100.0;
      }
      console.log("loaded, fading out volume", this.currentVolume);
      if (this.currentVolume <= 0) {
        this.state = "fadedout";
      }
    } else if (this.state === "fadedout") {
      if (this.currentAudio) {
        delete this.currentAudio;
      }
      if (this.currentSource) {
        delete this.currentSource;
      }
      if (this.currentGain) {
        delete this.currentGain;
      }
      this.currentUrl = this.targetUrl;
      this.currentAudio = this.nextAudio;
      this.currentGain = this.nextGain;
      this.currentSource = this.nextSource;
      this.state = "live";
      console.log("faded out");
    } else if (this.state === "live") {
      if (this.currentVolume < this.targetVolume) {
        this.currentVolume += 10;
      }
      if (this.currentVolume > this.targetVolume) {
        this.currentVolume -= 10;
      }
      this.currentVolume = Math.max(0, Math.min(100, this.currentVolume));
      // console.log("live", this.currentId, this.currentVolume);
      if (this.currentGain) {
        this.currentGain.gain.value = this.currentVolume / 100.0;
      }
      if (this.targetUrl !== this.currentUrl) {
        this.state = "switching";
      }
    } else if (this.state === "switching") {
      this.currentVolume = Math.max(0, this.currentVolume - 10);
      console.log("switching, fading out volume", this.currentVolume);
      if (this.currentGain) {
        this.currentGain.gain.value = this.currentVolume / 100.0;
      }
      if (this.currentVolume <= 0) {
        this.state = "idle";
      }
    }
  }
}
