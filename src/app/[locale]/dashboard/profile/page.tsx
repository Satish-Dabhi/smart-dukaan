import { Suspense } from "react";
import { Metadata } from "next";
import { getCachedSession } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Mail, Shield, Building2 } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

async function ProfileContent({ locale }: { locale: string }) {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const user = session.user;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>Your personal details and account status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {getInitials(user.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1 capitalize">
                {user.role ?? "Business Owner"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email address</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {user.role ?? "Business Owner"}
                </p>
              </div>
            </div>
            {user.businessId && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business ID</p>
                  <p className="text-sm font-medium text-foreground font-mono">
                    {user.businessId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Settings</CardTitle>
          <CardDescription>
            To update your business information, visit{" "}
            <a href={`/${locale}/dashboard/settings`} className="text-primary hover:underline">
              Settings
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense>
      <ProfileContent locale={locale} />
    </Suspense>
  );
}
