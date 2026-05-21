"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  GripVertical,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Category {
  _id: string;
  name: string;
  nameGu?: string;
  description?: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const FormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  nameGu: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
type FormData = z.infer<typeof FormSchema>;

interface Props {
  businessId?: string;
}

export function CategoriesManager({ businessId }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  const { data, isLoading } = useQuery({
    queryKey: ["categories", businessId],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      return json.data as Category[];
    },
    enabled: !!businessId,
  });

  const categories = data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(FormSchema) });

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: "", nameGu: "", description: "", sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      nameGu: cat.nameGu ?? "",
      description: cat.description ?? "",
      sortOrder: cat.sortOrder,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(editingCategory ? t("categoryUpdatedToast") : t("categoryCreatedToast"));
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async (cat: Category) => {
      const res = await fetch(`/api/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("categoryDeletedToast"));
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteId(null);
    },
  });

  if (!businessId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t("setupBusinessFirst")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("organiseProducts")}</p>
        </div>
        <Button variant="gradient" onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("addCategory")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 font-medium">{t("noCategoriesYet")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("createFirstCategorySub")}</p>
            <Button variant="gradient" onClick={openCreate} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              {t("addCategory")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {categories.map((cat) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {cat.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {cat.name}
                    </span>
                    {cat.nameGu && (
                      <span className="text-xs text-gray-400 truncate hidden sm:block">
                        {cat.nameGu}
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={cat.isActive ? "success" : "secondary"}>
                    {cat.isActive ? tCommon("active") : tCommon("inactive")}
                  </Badge>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {t("orderLabel", { count: cat.sortOrder })}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate(cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                    title={cat.isActive ? t("deactivate") : t("activate")}
                  >
                    {cat.isActive ? (
                      <ToggleRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? t("editCategory") : t("newCategory")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data: FormData) => saveMutation.mutate(data))}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("nameEnglish")}
              </label>
              <Input placeholder="e.g. Fruits & Vegetables" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{t("nameRequiredError")}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("nameGujarati")}
              </label>
              <Input placeholder="e.g. ફળ અને શાકભાજી" {...register("nameGu")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("description")}
              </label>
              <Input placeholder="Optional short description" {...register("description")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("sortOrder")}
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                {...register("sortOrder", { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-400">{t("lowerNumbersFirst")}</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                variant="gradient"
                loading={isSubmitting || saveMutation.isPending}
              >
                {editingCategory ? tCommon("save") : t("addCategory")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCategoryTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 py-2">{t("deleteCategoryDesc")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
