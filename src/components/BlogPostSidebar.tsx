'use client';
import React from 'react';

const BlogPostSidebar = () => {
  return (
    <aside className="md:w-1/4">
      <div className="sticky top-24 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          {/* Placeholder for recent posts */}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          {/* Placeholder for categories */}
        </div>
      </div>
    </aside>
  );
};

export default BlogPostSidebar;
