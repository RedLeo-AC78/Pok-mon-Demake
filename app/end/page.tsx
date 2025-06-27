"use client";

import { useEffect, useState } from "react";

export default function EndPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade-in
    setVisible(true);
    // Après 5s, retour au menu
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-center justify-center w-screen h-screen bg-black transition-opacity duration-1000 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="text-4xl text-white">À suivre, merci d’avoir joué</h1>
    </div>
  );
}
