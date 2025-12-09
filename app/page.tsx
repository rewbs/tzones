import Image from "next/image";
import { TimeControls } from "@/components/time-controls";
import { CityList } from "@/components/city-list";
import { Timeline } from "@/components/timeline";
import { DiscordWidget } from "@/components/discord-widget";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      <Header />

      <TimeControls />
      <CityList />
      <Timeline />
      <DiscordWidget />
    </main>
  );
}
