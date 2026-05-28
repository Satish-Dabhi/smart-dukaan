import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ConnectForm } from "@/components/demo/connect-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Live Demo — SmartDukaan",
  description:
    "Connect with our retail experts and get a personalized SmartDukaan storefront and POS billing demo tailored for your business.",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <ConnectForm />
      </div>
      <Suspense>
        <Footer />
      </Suspense>
    </main>
  );
}
