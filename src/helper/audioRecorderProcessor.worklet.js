class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
    this.targetSampleRate = 16000;
    this.promptName = '';
    this.audioContentName = '';
    
    this.port.onmessage = (event) => {
      if (event.data.type === 'start') {
        this.isRecording = true;
        this.promptName = event.data.promptName;
        this.audioContentName = event.data.audioContentName;
      } else if (event.data.type === 'stop') {
        this.isRecording = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording) {
      return true;
    }

    const input = inputs[0];
    if (!input || !input[0]) {
      return true;
    }

    const inputChannel = input[0];
    
    // Resample to 16kHz if needed
    let resampledData;
    if (sampleRate !== this.targetSampleRate) {
      resampledData = this.resample(inputChannel, sampleRate, this.targetSampleRate);
    } else {
      resampledData = inputChannel;
    }

    // Convert to Int16 PCM
    const buffer = new ArrayBuffer(resampledData.length * 2);
    const pcmData = new DataView(buffer);

    for (let i = 0; i < resampledData.length; i++) {
      const s = Math.max(-1, Math.min(1, resampledData[i]));
      pcmData.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    // Send audio data as ArrayBuffer to main thread
    this.port.postMessage({
      type: 'audio_data',
      audioData: buffer,
      promptName: this.promptName,
      audioContentName: this.audioContentName
    }, [buffer]); // Transfer the buffer to avoid copying

    return true;
  }

  resample(input, fromSampleRate, toSampleRate) {
    if (fromSampleRate === toSampleRate) {
      return input;
    }

    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(input.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const index = i * ratio;
      const indexFloor = Math.floor(index);
      const indexCeil = Math.min(indexFloor + 1, input.length - 1);
      const fraction = index - indexFloor;

      if (indexFloor === indexCeil) {
        result[i] = input[indexFloor];
      } else {
        result[i] = input[indexFloor] * (1 - fraction) + input[indexCeil] * fraction;
      }
    }

    return result;
  }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor); 