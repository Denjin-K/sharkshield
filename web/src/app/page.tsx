import { Hero } from "@/components/sections/Hero";
import { Longline } from "@/components/sections/Longline";
import { Strike } from "@/components/sections/Strike";
import { Unit } from "@/components/sections/Unit";
import { Logged } from "@/components/sections/Logged";
import { Deterrent } from "@/components/sections/Deterrent";
import { Comparison } from "@/components/sections/Comparison";
import { ResearchCards } from "@/components/sections/ResearchCards";
import { Join } from "@/components/sections/Join";

export default function Home() {
  return (
    <>
      <Hero />
      <Longline />
      <Strike />
      <Unit />
      <Logged />
      <Deterrent />
      <Comparison />
      <ResearchCards />
      <Join />
    </>
  );
}
