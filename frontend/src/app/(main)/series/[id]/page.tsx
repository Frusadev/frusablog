import type { Metadata } from "next";
import { getPostSeries } from "@/lib/api/requests/post-series";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import SeriesDetailClient from "./SeriesDetailClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for the series
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const series = await getPostSeries(id);
    
    if (!series) {
      return {
        title: "Series Not Found - Ametsowou.me",
        description: "The requested series could not be found.",
      };
    }

    const title = `${series.title} - Ametsowou.me`;
    const description = series.description || `Explore the ${series.title} series with detailed posts and tutorials.`;
    const coverImageUrl = series.cover ? getResourceUrl(series.cover) : null;

    return {
      title,
      description,
      openGraph: {
        title: series.title,
        description,
        type: "website",
        siteName: "Ametsowou.me",
        images: coverImageUrl ? [
          {
            url: coverImageUrl,
            width: 1200,
            height: 630,
            alt: series.title,
          },
        ] : [],
      },
      twitter: {
        card: coverImageUrl ? "summary_large_image" : "summary",
        title: series.title,
        description,
        images: coverImageUrl ? [coverImageUrl] : [],
      },
      keywords: `${series.title}, tutorial series, programming, technology, blog`,
    };
  } catch (error) {
    console.error("Error generating metadata for series:", error);
    return {
      title: "Series - Ametsowou.me",
      description: "Explore detailed series of posts and tutorials on technology, programming, and more.",
    };
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  const { id } = await params;
  return <SeriesDetailClient seriesId={id} />;
}
