import { Hero } from "@/components/sections/Hero";
import { Longline } from "@/components/sections/Longline";
import { Strike } from "@/components/sections/Strike";
import { Unit } from "@/components/sections/Unit";
import { Logged } from "@/components/sections/Logged";
import { Deterrent } from "@/components/sections/Deterrent";
import { Comparison } from "@/components/sections/Comparison";
import { ResearchCards } from "@/components/sections/ResearchCards";
import { Join } from "@/components/sections/Join";
import { Marquee } from "@/components/Marquee";
import { t } from "@/lib/t";

const mq = t("marquee");

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee items={[mq.a, mq.b, mq.c, mq.d]} />
      <Longline />
      <Strike />
      <Unit />
      <Logged />
      <Deterrent />
      <Comparison />
      <ResearchCards />
      <Marquee items={[mq.d, mq.a, mq.c, mq.b]} />
      <Join />
    </>
  );
}
