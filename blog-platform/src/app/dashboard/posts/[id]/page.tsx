"use client";

import { PostForm } from "@/components/post-form";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";

export default function EditPostPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);

  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id: postId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-500">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Post not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PostForm mode="edit" initialData={post} />
    </div>
  );
}
