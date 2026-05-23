import { Suspense } from "react";
import { Metadata } from "next";
import { ProfileManager } from "@/components/dashboard/profile/profile-manager";
import { getCachedSession } from "@/lib/auth-cache";

export const metadata: Metadata = { title: "My Profile" };

async function ProfileContent() {
  const session = await getCachedSession();
  return <ProfileManager session={session} />;
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
