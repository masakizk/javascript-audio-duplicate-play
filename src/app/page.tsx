import Image from 'next/image'
import styles from './page.module.css'
"use client";

import axios from 'axios'
import { useRef, useState } from 'react';

export default function Home() {
  const { playMusic, stopMusic } = useMusic();

  return (
    <div>
      <button onClick={async () => await playMusic()}>Play Music</button>
      <button onClick={async () => await stopMusic()}>Stop Music</button>
    </div>
  )
}

const useMusic = () => {
  // 次の音声が再生可能かどうか（再生準備中の音声がないか）
  const [isReady, setIsReady] = useState(true);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playMusic = async () => {
    console.log({
      status: "try play",
      isReady,
    });

    setIsReady(false);
    await stopMusic();

    audioSourceRef.current = await new Promise(async (resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const blob = e.target.result as ArrayBuffer;
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(blob, (buffer) => {
          const source = audioContext.createBufferSource();

          source.buffer = buffer;
          source.connect(audioContext.destination);

          // 再生
          console.log({
            status: "play",
            audioContextState: audioContext.state,
          })
          source.start(0);
          setIsReady(true);
          resolve(source);
        });
      }

      const blob = await fetchAudioBlob();
      reader.readAsArrayBuffer(blob);
    });
  }

  const stopMusic = async () => {
    await new Promise((resolve) => {
      console.log({
        status: "try stop",
        audioSource: !!audioSourceRef.current,
      })

      if (audioSourceRef.current) {
        const audioSource = audioSourceRef.current;
        audioSource.stop();
        audioSource.disconnect();
        audioSourceRef.current = null;
        console.log({
          status: "stop",
        })
      }
      
      resolve(0);
    });
  }

  return {
    playMusic,
    stopMusic,
  }
}

const fetchAudioBlob = async (): Promise<Blob> => {
  const { data } = await axios.get("/music.mp3", { responseType: 'blob' });
  return data;
}
