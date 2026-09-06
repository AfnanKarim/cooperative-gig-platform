"use client";

import dynamic from "next/dynamic";

const VeyraMap = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function MapWrapper() {
  return <VeyraMap />;
}