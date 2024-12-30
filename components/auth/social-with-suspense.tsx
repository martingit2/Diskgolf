"use client";

import { Suspense } from "react";
import { Social } from "./social";

const SocialWithSuspense = () => {
  return (
    <Suspense fallback={<div>Laster inn sosiale knapper...</div>}>
      <Social />
    </Suspense>
  );
};

export default SocialWithSuspense;
