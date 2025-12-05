import Image from "next/image";
import { TimeControls } from "@/components/time-controls";
import { CityList } from "@/components/city-list";
import { Timeline } from "@/components/timeline";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Global Time Zone Comparison
        </h1>
        {/* Controls like share/theme could go here */}
      </header>

      <TimeControls />
      <CityList />
      <Timeline />
    </main>
  );
}
