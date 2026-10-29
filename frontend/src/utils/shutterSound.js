// A short, quiet camera shutter sound made with the Web Audio API (no audio files).
// Call playShutterSound() only from a click handler: browsers block sound before a click.

const VOLUME = 0.12

let audioContext = null

// One tiny burst of filtered noise = one "click" of the shutter.
function playClick(context, startTime, duration, volume) {
  const length = Math.floor(context.sampleRate * duration)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3
  }

  const source = context.createBufferSource()
  source.buffer = buffer

  const filter = context.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1800

  const gain = context.createGain()
  gain.gain.value = volume

  source.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  source.start(startTime)
}

export function playShutterSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) {
    return
  }
  if (!audioContext) {
    audioContext = new AudioContextClass()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  const now = audioContext.currentTime
  playClick(audioContext, now, 0.05, VOLUME)
  playClick(audioContext, now + 0.08, 0.07, VOLUME * 0.7)
}
