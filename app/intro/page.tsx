"use client";

import { useEffect, useRef } from "react";

export default function IntroPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current!;
    const goNext = () => {
      window.location.href = "/crea";
    };

    // end of video
    vid.addEventListener("ended", goNext);

    // Press Enter
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      vid.removeEventListener("ended", goNext);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src="/video/intro.mp4"
        className="max_w_full max-h-full"
      />
    </div>
  );
}
