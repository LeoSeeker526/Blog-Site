"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data: postsData, isLoading } = trpc.posts.getAll.useQuery({
    published: true,
    categoryId: selectedCategoryId,
    limit: 50,
  });

  const { data: categories } = trpc.categories.getAll.useQuery();

  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Blog</h1>
          <p className="text-xl text-gray-700 mb-8">
            Discover insights, stories, and knowledge
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* Categories Filter */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId(undefined)}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-3">
              Showing posts in <strong>{selectedCategory.name}</strong>: {selectedCategory.description}
            </p>
          )}
        </section>
      )}

      {/* Blog Posts */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">
          {selectedCategoryId ? `${selectedCategory?.name} Posts` : "Latest Posts"}
        </h2>
        
        {isLoading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : postsData?.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedCategoryId 
                ? `No published posts in ${selectedCategory?.name} yet`
                : "No published posts yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData?.items.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.categories?.slice(0, 3).map((cat: any) => (
                      <Badge key={cat.id} variant="secondary" className="text-xs">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {post.content.substring(0, 120)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
