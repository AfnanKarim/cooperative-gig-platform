"use client";

import { useEffect, useState } from "react";

const workers = [
  { name: "Worker A", x: "18%", y: "25%" },
  { name: "Worker B", x: "78%", y: "20%" },
  { name: "Worker C", x: "75%", y: "72%" },
];

const stages = [
  "Request received",
  "Understanding request",
  "Evaluating workers",
  "Best match found",
];

export default function VeyraMatching() {
  const [stage, setStage] = useState(0);
  const [activeWorker, setActiveWorker] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((current) => {
        const next = (current + 1) % stages.length;

        if (next === 2) {
          setActiveWorker(null);
        }

        if (next === 3) {
          setActiveWorker(1);
        }

        if (next === 0) {
          setActiveWorker(null);
        }

        return next;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[900] overflow-hidden">
      {/* =====================================================
          GLOWING CONNECTION NETWORK
          ===================================================== */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Main glow */}
          <filter
            id="strongGlow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Worker glow */}
          <filter
            id="softGlow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Moving light */}
          <filter
            id="dotGlow"
            x="-500%"
            y="-500%"
            width="1000%"
            height="1000%"
          >
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* -------------------------------------------------
            CUSTOMER → VEYRA
            Strongest connection
            ------------------------------------------------- */}

        <line
          x1="10"
          y1="52"
          x2="50"
          y2="50"
          stroke="#34d399"
          strokeWidth="1.2"
          opacity="0.35"
          filter="url(#strongGlow)"
        />

        <line
          x1="10"
          y1="52"
          x2="50"
          y2="50"
          stroke="#6ee7b7"
          strokeWidth="0.45"
          filter="url(#strongGlow)"
        />

        {/* -------------------------------------------------
            VEYRA → WORKER A
            ------------------------------------------------- */}

        <line
          x1="50"
          y1="50"
          x2="18"
          y2="25"
          stroke="#6ee7b7"
          strokeWidth={activeWorker === 0 ? "1.0" : "0.28"}
          opacity={activeWorker === 0 ? "0.9" : "0.35"}
          filter="url(#softGlow)"
          className="transition-all duration-700"
        />

        {/* -------------------------------------------------
            VEYRA → WORKER B
            Selected worker gets strong glow
            ------------------------------------------------- */}

        <line
          x1="50"
          y1="50"
          x2="78"
          y2="20"
          stroke="#34d399"
          strokeWidth={activeWorker === 1 ? "1.15" : "0.28"}
          opacity={activeWorker === 1 ? "1" : "0.35"}
          filter="url(#strongGlow)"
          className="transition-all duration-700"
        />

        {/* -------------------------------------------------
            VEYRA → WORKER C
            ------------------------------------------------- */}

        <line
          x1="50"
          y1="50"
          x2="75"
          y2="72"
          stroke="#6ee7b7"
          strokeWidth={activeWorker === 2 ? "1.0" : "0.28"}
          opacity={activeWorker === 2 ? "0.9" : "0.35"}
          filter="url(#softGlow)"
          className="transition-all duration-700"
        />

        {/* =================================================
            MOVING LIGHTS
            ================================================= */}

        {/* Customer → Veyra */}
        <circle
          cx="10"
          cy="52"
          r="1.2"
          fill="#ecfdf5"
          filter="url(#dotGlow)"
        >
          <animate
            attributeName="cx"
            from="10"
            to="50"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            from="52"
            to="50"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Veyra → Worker A */}
        <circle
          cx="50"
          cy="50"
          r="0.8"
          fill="#a7f3d0"
          opacity="0.8"
          filter="url(#dotGlow)"
        >
          <animate
            attributeName="cx"
            from="50"
            to="18"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            from="50"
            to="25"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Veyra → Worker B */}
        <circle
          cx="50"
          cy="50"
          r="1.1"
          fill="#ecfdf5"
          filter="url(#dotGlow)"
        >
          <animate
            attributeName="cx"
            from="50"
            to="78"
            dur="1.7s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            from="50"
            to="20"
            dur="1.7s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Veyra → Worker C */}
        <circle
          cx="50"
          cy="50"
          r="0.8"
          fill="#a7f3d0"
          opacity="0.8"
          filter="url(#dotGlow)"
        >
          <animate
            attributeName="cx"
            from="50"
            to="75"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            from="50"
            to="72"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* =====================================================
          CUSTOMER
          ===================================================== */}

      <div
        className="absolute"
        style={{ left: "7%", top: "45%" }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-sm shadow-xl">
          📱
        </div>

        <div className="mt-2 rounded-lg bg-slate-950/90 px-2 py-1 text-[9px] font-semibold text-white">
          Customer
        </div>
      </div>

      {/* =====================================================
          VEYRA AI
          ===================================================== */}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">

          {/* Outer glow */}
          <div className="absolute inset-[-16px] animate-ping rounded-full bg-emerald-400/15" />

          {/* Stronger static glow */}
          <div className="absolute inset-[-7px] rounded-full bg-emerald-400/20 blur-md" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.5)]">
            <span className="text-2xl text-emerald-400">✦</span>
          </div>

          <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950/95 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg">
            VEYRA AI
          </div>
        </div>
      </div>

      {/* =====================================================
          WORKERS
          ===================================================== */}

      {workers.map((worker, index) => {
        const isSelected = activeWorker === index;

        return (
          <div
            key={worker.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{
              left: worker.x,
              top: worker.y,
              transform: `translate(-50%, -50%) scale(${
                isSelected ? 1.15 : 1
              })`,
            }}
          >
            {/* Selected worker glow */}
            {isSelected && (
              <div className="absolute inset-[-9px] animate-ping rounded-full bg-emerald-400/30" />
            )}

            <div
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-xl transition-all duration-500 ${
                isSelected
                  ? "border-emerald-200 bg-emerald-500 shadow-[0_0_25px_rgba(52,211,153,0.8)]"
                  : "border-white bg-slate-950"
              }`}
            >
              <span className="text-lg">👷</span>
            </div>

            <div
              className={`mt-2 whitespace-nowrap rounded-lg px-2 py-1 text-[9px] font-semibold shadow-lg transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-950/90 text-white"
              }`}
            >
              {isSelected ? "✓ Best match" : worker.name}
            </div>
          </div>
        );
      })}

      {/* =====================================================
          STATUS
          ===================================================== */}

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

          <div>
            <p className="text-[9px] font-bold tracking-[0.15em] text-slate-400">
              VEYRA MATCHING
            </p>

            <p className="mt-0.5 whitespace-nowrap text-xs font-bold text-slate-800">
              {stages[stage]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}