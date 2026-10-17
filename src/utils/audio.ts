/**
 * Audio helpers for recording and playback in Sawti AI
 */

export interface AudioRecorderController {
  start: () => Promise<void>;
  stop: () => Promise<{ blob: Blob; base64: string; mimeType: string; duration: number }>;
  cancel: () => void;
  getAnalyser: () => AnalyserNode | null;
  getAudioContext: () => AudioContext | null;
}

export async function createAudioRecorder(): Promise<AudioRecorderController> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  let mediaRecorder: MediaRecorder | null = null;
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav',
  ];
  let chosenMime = '';
  for (const m of mimeTypes) {
    if (MediaRecorder.isTypeSupported(m)) {
      chosenMime = m;
      break;
    }
  }

  mediaRecorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
  const chunks: Blob[] = [];
  let startTime = 0;

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return {
    async start() {
      chunks.length = 0;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      startTime = Date.now();
      mediaRecorder?.start(100);
    },
    stop() {
      return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
          return reject(new Error('Recorder not initialized'));
        }

        const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

        mediaRecorder.onstop = async () => {
          try {
            const finalMime = mediaRecorder?.mimeType || chosenMime || 'audio/webm';
            const blob = new Blob(chunks, { type: finalMime });
            const base64 = await blobToBase64(blob);

            // Clean up tracks
            stream.getTracks().forEach((track) => track.stop());
            if (audioContext.state !== 'closed') {
              audioContext.close().catch(() => {});
            }

            resolve({ blob, base64, mimeType: finalMime, duration });
          } catch (err) {
            reject(err);
          }
        };

        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });
    },
    cancel() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      stream.getTracks().forEach((track) => track.stop());
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    },
    getAnalyser() {
      return analyser;
    },
    getAudioContext() {
      return audioContext;
    },
  };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      // remove data:audio/*;base64, prefix
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Format duration seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
