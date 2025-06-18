import type { Metadata } from "next";
import { getPost } from "@/lib/api/requests/post";
import { extractIdFromSlug } from "@/lib/utils/slug";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import PostViewClient from "./PostViewClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const postId = extractIdFromSlug(slug);

  try {
    const post = await getPost(postId);
    
    if (!post) {
      return {
        title: "Post Not Found - Ametsowou.me",
        description: "The requested post could not be found.",
      };
    }

    const title = `${post.title} - Ametsowou.me`;
    const description = post.description || `Read ${post.title} by ${post.author.name || post.author.username}`;
    const coverImageUrl = post.cover ? getResourceUrl(post.cover) : null;

    return {
      title,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
        authors: [post.author.name || post.author.username],
        publishedTime: post.created_at,
        tags: post.tags?.map(tag => tag.name) || [],
        images: coverImageUrl ? [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ] : [],
      },
      twitter: {
        card: coverImageUrl ? "summary_large_image" : "summary",
        title: post.title,
        description,
        images: coverImageUrl ? [coverImageUrl] : [],
      },
      authors: [{ name: post.author.name || post.author.username }],
      keywords: post.tags?.map(tag => tag.name).join(", ") || "",
    };
  } catch (error) {
    console.error("Error generating metadata for post:", error);
    return {
      title: "Post - Ametsowou.me",
      description: "Stay ahead in the ever-evolving world of technology with tutorials, coding tips, software reviews, dev stories, and deep dives into AI, web dev, open-source, and more.",
    };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return <PostViewClient slug={slug} />;
}
