"use client";

import dynamic from "next/dynamic";

const VeyraMap = dynamic(() => import("./Map"), {
  ssr: false,
});

type MapWrapperProps = {
  city?: string | null;
  pinCode?: string | null;
};

export default function MapWrapper({
  city,
  pinCode,
}: MapWrapperProps) {
  return (
    <VeyraMap
      city={city}
      pinCode={pinCode}
    />
  );
}