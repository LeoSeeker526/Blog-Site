"use client";

import { trpc } from "@/trpc/client";

export default function HomePage() {
  // Use tRPC hooks directly - no .queryOptions()
  const { data: postsData, isLoading: postsLoading, error: postsError } = 
    trpc.posts.getAll.useQuery({
      published: true,
      limit: 10,
    });

  // Fetch all categories
  const { data: categoriesData, isLoading: categoriesLoading } = 
    trpc.categories.getAll.useQuery();

  if (postsLoading || categoriesLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (postsError) {
    return <div className="p-8">Error: {postsError.message}</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {categoriesData?.map((category) => (
            <span
              key={category.id}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {postsData?.items.length === 0 ? (
          <p className="text-gray-500">No posts yet. Create your first post!</p>
        ) : (
          postsData?.items.map((post) => (
            <div key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">
                {post.content.substring(0, 150)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  post.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
