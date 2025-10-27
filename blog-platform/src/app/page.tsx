"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 9;

export default function HomePage() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch featured posts (3 most recent)
  const { data: featuredData, isLoading: featuredLoading } = trpc.posts.getAll.useQuery({
    published: true,
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    limit: 3,
  });

  // Fetch all posts with pagination
  const { data: allPostsData, isLoading: allPostsLoading } = trpc.posts.getAll.useQuery({
    published: true,
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    limit: 100, // Get all posts for pagination
  });

  const { data: categories } = trpc.categories.getAll.useQuery();

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setCurrentPage(1);
  };

  const selectedCategories = categories?.filter((c) =>
    selectedCategoryIds.includes(c.id)
  );

  // Pagination logic
  const allPosts = allPostsData?.items || [];
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, endIndex);

  const featuredPosts = featuredData?.items || [];

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
            <div>
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              {selectedCategoryIds.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategoryIds.length} categor
                  {selectedCategoryIds.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>
            {selectedCategoryIds.length > 0 && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          {selectedCategories && selectedCategories.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Showing posts in:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge
                    key={category.id}
                    className="bg-blue-600 text-white px-3 py-1 cursor-pointer hover:bg-blue-700"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                    <X className="ml-2 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
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
        </section>
      )}

      {/* Featured Posts Section - 3 Most Recent in 2:1:1 Ratio */}
      {!featuredLoading && featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-b">
          <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Large Featured Post (2 columns) */}
            {featuredPosts[0] && (
              <Card className="md:row-span-2 hover:shadow-xl transition">
                <CardContent className="pt-6 h-full flex flex-col">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {featuredPosts[0].categories?.slice(0, 3).map((cat: any) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-gray-300"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    {featuredPosts[0].title}
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {featuredPosts[0].content.substring(0, 250)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {new Date(featuredPosts[0].createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/posts/${featuredPosts[0].slug}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Read more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Two Smaller Featured Posts (1 column each) */}
            <div className="space-y-6">
              {featuredPosts.slice(1, 3).map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.categories?.slice(0, 2).map((cat: any) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-gray-300"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">
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
          </div>
        </section>
      )}

      {/* All Posts Section - 3x3 Grid with Pagination */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            All Posts
            {allPosts.length > 0 && (
              <span className="text-gray-500 text-xl ml-3">
                ({allPosts.length})
              </span>
            )}
          </h2>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {allPostsLoading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {selectedCategoryIds.length > 0
                ? "No posts found with the selected categories"
                : "No published posts yet"}
            </p>
            {selectedCategoryIds.length > 0 && (
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* 3x3 Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition h-full">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.categories?.slice(0, 2).map((cat: any) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-gray-300"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {post.content.substring(0, 100)}...
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

                    if (!showPage) {
                      // Show ellipsis for skipped pages
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
