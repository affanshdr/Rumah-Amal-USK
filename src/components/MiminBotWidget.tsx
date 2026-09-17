"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ra_bot_announcement_seen_v1";
const ALWAYS_SHOW = process.env.NODE_ENV === "development";
const MIMIN_BOT_IMG = "/mimin-bot.png";
const CHAT_LINK = "https://103.55.38.120.nip.io/pilih-channel";
const BOT_MESSAGE =
  "Assalamu'alaikum! \u{1F44B} Sekarang ada Mimin AI di Rumah Amal USK. Tanya zakat, infak & program langsung lewat chat.";

type Phase = "hidden" | "robot-enter" | "idle" | "bubble-exit" | "robot-exit";

export default function MiminBotWidget() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [typedText, setTypedText] = useState("");
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function typeMessage() {
    setTypedText("");
    let i = 0;
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    typeIntervalRef.current = setInterval(() => {
      i++;
      setTypedText(BOT_MESSAGE.slice(0, i));
      if (i >= BOT_MESSAGE.length && typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
      }
    }, 28);
  }

  function show() {
    setPhase("robot-enter");
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(close, 9500);
  }

  function close() {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    closeTimersRef.current.forEach(clearTimeout);
    closeTimersRef.current = [];

    setPhase((p) => (p === "hidden" ? p : "bubble-exit"));
    closeTimersRef.current.push(
      setTimeout(() => setPhase((p) => (p === "hidden" ? p : "robot-exit")), 220)
    );
    closeTimersRef.current.push(setTimeout(() => setPhase("hidden"), 570));
  }

  function handlePause() {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
  }

  function handleResume() {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(close, 4000);
  }

  function handleRobotAnimationEnd(e: React.AnimationEvent<HTMLImageElement>) {
    if (e.animationName !== "ra-bot-bounce-in") return;
    setPhase("idle");
    typeMessage();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Saat `next dev`, abaikan gate "sudah pernah lihat" supaya widget selalu
    // muncul tiap refresh dan gampang dites. Di production tetap sekali saja.
    if (!ALWAYS_SHOW && localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => {
      show();
      if (!ALWAYS_SHOW) localStorage.setItem(STORAGE_KEY, "1");
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      closeTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  if (phase === "hidden") return null;

  const bubbleClass =
    phase === "idle"
      ? "ra-bot-bubble ra-bot-bubble-enter"
      : phase === "bubble-exit" || phase === "robot-exit"
      ? "ra-bot-bubble ra-bot-bubble-exit"
      : "ra-bot-bubble";

  const robotClass =
    phase === "robot-enter"
      ? "ra-bot-figure ra-bot-robot-enter"
      : phase === "robot-exit"
      ? "ra-bot-figure ra-bot-robot-exit"
      : "ra-bot-figure ra-bot-idle";

  const showCaret = typedText.length > 0 && typedText.length < BOT_MESSAGE.length;

  return (
    <div className="ra-bot-toast" onMouseEnter={handlePause} onMouseLeave={handleResume}>
      <style>{`
        .ra-bot-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          left: 20px;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        @media (min-width: 640px) {
          .ra-bot-toast { left: auto; }
        }

        .ra-bot-bubble {
          position: relative;
          flex: 1 1 auto;
          background: linear-gradient(135deg, #0b6330, #155c36);
          color: #ffffff;
          border-radius: 16px;
          padding: 16px 12px 16px 16px;
          box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .ra-bot-bubble { flex: 0 0 auto; width: 256px; }
        }
        .ra-bot-bubble.ra-bot-bubble-enter { animation: ra-bot-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; pointer-events: auto; }
        .ra-bot-bubble.ra-bot-bubble-exit { animation: ra-bot-pop-out 0.25s ease-in forwards; pointer-events: none; }

        .ra-bot-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
        }
        .ra-bot-close:hover { color: #fff; background: rgba(255, 255, 255, 0.12); }

        .ra-bot-text { margin: 0; padding-right: 16px; font-size: 13px; line-height: 1.55; font-weight: 500; }
        .ra-bot-caret::after { content: '|'; margin-left: 1px; animation: ra-bot-blink 0.9s step-end infinite; }

        .ra-bot-cta {
          display: inline-block;
          margin-top: 10px;
          background: #ffc800;
          color: #112b27;
          font-weight: 800;
          font-size: 12px;
          padding: 7px 16px;
          border-radius: 999px;
          text-decoration: none;
        }
        .ra-bot-cta:hover { background: #e8b500; }

        .ra-bot-figure {
          width: 96px;
          height: 96px;
          flex-shrink: 0;
          user-select: none;
          pointer-events: none;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.25));
          opacity: 0;
        }
        @media (min-width: 640px) {
          .ra-bot-figure { width: 112px; height: 112px; }
        }

        @keyframes ra-bot-bounce-in {
          0%   { opacity: 0; transform: translateY(90px) scale(0.35) rotate(0deg); }
          50%  { opacity: 1; transform: translateY(-16px) scale(1.08) rotate(-4deg); }
          70%  { transform: translateY(8px) scale(0.96) rotate(3deg); }
          85%  { transform: translateY(-4px) scale(1.02) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes ra-bot-exit-fall {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(30px) scale(0.5); }
        }
        @keyframes ra-bot-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          20% { transform: rotate(-9deg); }
          40% { transform: rotate(7deg); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(4deg); }
        }
        @keyframes ra-bot-pop-in {
          0%   { opacity: 0; transform: scale(0.7) translateX(14px); }
          60%  { opacity: 1; transform: scale(1.04) translateX(0); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
        @keyframes ra-bot-pop-out {
          from { opacity: 1; transform: scale(1) translateX(0); }
          to   { opacity: 0; transform: scale(0.8) translateX(14px); }
        }
        @keyframes ra-bot-blink { 50% { opacity: 0; } }

        .ra-bot-figure.ra-bot-robot-enter { animation: ra-bot-bounce-in 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .ra-bot-figure.ra-bot-robot-exit { animation: ra-bot-exit-fall 0.35s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .ra-bot-figure.ra-bot-idle { opacity: 1; animation: ra-bot-bob 2s ease-in-out infinite; transform-origin: 70% 70%; }
      `}</style>

      <div className={bubbleClass}>
        <button type="button" onClick={close} className="ra-bot-close" aria-label="Tutup">
          &#10005;
        </button>
        <p className={`ra-bot-text${showCaret ? " ra-bot-caret" : ""}`}>{typedText}</p>
        <a href={CHAT_LINK} className="ra-bot-cta" onClick={close}>
          Coba Sekarang
        </a>
      </div>

      <img
        src={MIMIN_BOT_IMG}
        alt="Mimin AI"
        className={robotClass}
        onAnimationEnd={handleRobotAnimationEnd}
      />
    </div>
  );
}
