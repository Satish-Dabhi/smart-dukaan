import { Suspense } from "react";
import { Metadata } from "next";
import { BusinessSettings } from "@/components/dashboard/business-settings";

export const metadata: Metadata = { title: "Settings" };

function SettingsContent() {
  return <BusinessSettings />;
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
