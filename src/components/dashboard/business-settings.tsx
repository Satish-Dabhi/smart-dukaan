"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Phone, MapPin, Receipt, Palette, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6).max(6),
  gstNumber: z.string().optional(),
  description: z.string().optional(),
  tagline: z.string().optional(),
  whatsappNumber: z.string().optional(),
  theme: z.string().optional(),
  primaryColor: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const themes = [
  { value: "grocery", label: "🛒 Grocery", description: "Fresh & earthy greens" },
  { value: "cafe", label: "☕ Cafe", description: "Warm amber tones" },
  { value: "bakery", label: "🥐 Bakery", description: "Soft rose & cream" },
  { value: "restaurant", label: "🍕 Restaurant", description: "Bold red & orange" },
  { value: "medical", label: "💊 Medical", description: "Clean blue & white" },
  { value: "salon", label: "✂️ Salon", description: "Elegant purple & pink" },
  { value: "retail", label: "👗 Retail", description: "Modern indigo" },
  { value: "minimal", label: "⬡ Minimal", description: "Clean violet gradient" },
];

interface Props {
  userId?: string;
}

export function BusinessSettings({ userId }: Props) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const t = useTranslations("settings");

  const { data: businessData, isLoading } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const res = await fetch("/api/business");
      return res.json();
    },
  });

  const business = businessData?.data;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: business
      ? {
          name: business.name,
          phone: business.phone,
          email: business.email,
          address: business.address,
          city: business.city,
          state: business.state,
          pincode: business.pincode,
          gstNumber: business.gstNumber ?? "",
          description: business.description ?? "",
          tagline: business.tagline ?? "",
          whatsappNumber: business.whatsappNumber ?? "",
          theme: business.theme ?? "minimal",
          primaryColor: business.primaryColor ?? "#7c3aed",
        }
      : undefined,
  });

  const selectedTheme = watch("theme");

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = business ? "PUT" : "POST";
      const res = await fetch("/api/business", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success(business ? t("settingsSavedToast") : t("businessCreatedToast"));
      queryClient.invalidateQueries({ queryKey: ["business"] });
      setIsCreating(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!business && !isCreating) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("setupStore")}
          </h2>
          <p className="text-gray-500 mb-6">
            {t("setupStoreSub")}
          </p>
          <Button variant="gradient" size="lg" onClick={() => setIsCreating(true)}>
            {t("createBusinessBtn")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {business ? t("businessSettings") : t("createBusiness")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {business ? t("manageSettingsFor", { name: business.name }) : t("fillDetailsToGetStarted")}
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4" /> {t("basicInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "name" as const, label: t("businessName"), placeholder: "Fresh Mart" },
              { name: "email" as const, label: t("emailRequired"), placeholder: "hello@freshmart.com", type: "email" },
              { name: "phone" as const, label: t("phoneRequired"), placeholder: "+91 9876543210" },
              { name: "whatsappNumber" as const, label: t("whatsappNumber"), placeholder: "+91 9876543210" },
              { name: "gstNumber" as const, label: t("gstNumber"), placeholder: "22AAAAA0000A1Z5" },
              { name: "tagline" as const, label: t("tagline"), placeholder: "Fresh groceries delivered!" },
            ].map((field) => (
              <div key={field.name} className={field.name === "tagline" ? "sm:col-span-2" : ""}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {field.label}
                </label>
                <Input
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  className={errors[field.name] ? "border-red-500" : ""}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.name]?.message as string}</p>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t("description")}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder={t("tellCustomersAbout")}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4" /> {t("address")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "address" as const, label: t("streetAddress"), placeholder: "123, Main Street", span: true },
              { name: "city" as const, label: t("cityRequired"), placeholder: "Ahmedabad" },
              { name: "state" as const, label: t("stateRequired"), placeholder: "Gujarat" },
              { name: "pincode" as const, label: t("pincodeRequired"), placeholder: "380001" },
            ].map((field) => (
              <div key={field.name} className={field.span ? "sm:col-span-2" : ""}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {field.label}
                </label>
                <Input
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  className={errors[field.name] ? "border-red-500" : ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="w-4 h-4" /> {t("storefrontTheme")}
            </CardTitle>
            <CardDescription>{t("chooseLookFeel")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => setValue("theme", theme.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTheme === theme.value
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="text-xl mb-1">{theme.label.split(" ")[0]}</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    {theme.label.split(" ").slice(1).join(" ")}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{theme.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="gradient" size="lg" loading={mutation.isPending}>
            {business ? t("saveChanges") : t("createBusinessBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}
