"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading, error } = trpc.posts.getBySlug.useQuery(
    { slug },
    {
      enabled: !!slug,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-8">
              <div className="mb-8">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((cat: any) => (
                      <Link key={cat.id} href={`/?category=${cat.id}`}>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-gray-300"
                        >
                          {cat.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
                
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <time dateTime={post.createdAt.toString()}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-strong:text-gray-900">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              <div className="mt-12 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    ← Back to all posts
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-700 hover:underline"
                  >
                    Go to Dashboard →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
}
