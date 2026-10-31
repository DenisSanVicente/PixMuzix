
export default class SoundService {

    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new AudioContext();
    }

    playTone(frequency: number): void {

        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.setValueAtTime(0.15, now + 0.4);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }
}
