"use client";

import { useEffect, useRef } from "react";

export default function IntroPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quand le composant monte, on joue la vidéo et on ajoute les listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Lance la vidéo (autoplay)
    video.play().catch(() => {
      // Certains navigateurs exigent un clic, mais ici on suppose que c'est OK
    });

    // À la fin, on redirige
    const onEnded = () => {
      window.location.href = "/crea";
    };
    video.addEventListener("ended", onEnded);

    // Saut au clavier
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        video.pause();
        window.location.href = "/crea";
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      <video
        ref={videoRef}
        src="/videos/Intro.mp4"
        className="w-full h-full object-cover"
        muted={false}
        controls={false}
      />
      {/* Optionnel : un petit message "Appuyez sur Entrée pour passer" */}
      <div className="absolute bottom-8 w-full text-center text-white text-sm tracking-wider">
        Appuyez sur Entrée pour passer
      </div>
    </div>
  );
}
