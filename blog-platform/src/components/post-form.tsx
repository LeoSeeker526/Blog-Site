"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/slugify";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Zod schema for post validation
const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1, "Slug is required").max(255),
  published: z.boolean(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: Partial<PostFormData> & { id?: number };
  mode: "create" | "edit";
}

export function PostForm({ initialData, mode }: PostFormProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      slug: initialData?.slug || "",
      published: initialData?.published || false,
    },
  });

  // Watch title for auto-slug generation
  const title = watch("title");
  const published = watch("published");

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (autoSlug && newTitle) {
      setValue("slug", slugify(newTitle));
    }
  };

  // Create mutation
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.getAll.invalidate();
      router.push("/dashboard");
    },
  });

  // Update mutation
  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.getAll.invalidate();
      router.push("/dashboard");
    },
  });

  const onSubmit = (data: PostFormData) => {
    if (mode === "create") {
      createPost.mutate(data);
    } else if (initialData?.id) {
      updatePost.mutate({ ...data, id: initialData.id });
    }
  };

  const isLoading = createPost.isPending || updatePost.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              onChange={(e) => {
                register("title").onChange(e);
                handleTitleChange(e);
              }}
              placeholder="Enter post title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-xs text-blue-600 hover:underline"
              >
                {autoSlug ? "Manual edit" : "Auto-generate"}
              </button>
            </div>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="post-url-slug"
              disabled={autoSlug}
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your post content here... You can use Markdown!"
              rows={15}
              className={errors.content ? "border-red-500" : ""}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Tip: Use Markdown for formatting (e.g., **bold**, *italic*, # headings)
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              id="published"
              {...register("published")}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
              <p className="text-sm text-gray-500">
                {published
                  ? "This post will be visible to everyone"
                  : "This post will be saved as a draft"}
              </p>
            </div>
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : mode === "create"
            ? "Create Post"
            : "Update Post"}
        </Button>
      </div>

      {/* Error Display */}
      {(createPost.error || updatePost.error) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">
              {createPost.error?.message || updatePost.error?.message}
            </p>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
