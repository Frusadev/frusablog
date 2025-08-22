"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClickableTag from "@/components/ui/custom/ClickableTag";
import Show from "@/components/wrappers/Show";
import {
  Star,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { getResourceUrl } from "@/lib/utils/fileUtils";
import { createPostSlug } from "@/lib/utils/slug";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FeaturedPost {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  created_at?: string;
  author: {
    name?: string;
    username: string;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
}

interface FeaturedPostsCarouselProps {
  featuredPosts: FeaturedPost[];
}

export default function FeaturedPostsCarousel({ featuredPosts }: FeaturedPostsCarouselProps) {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const router = useRouter();

  // Carousel navigation functions with animation support
  const nextSlide = useCallback(() => {
    if (isTransitioning || featuredPosts.length <= 1) return;
    setIsTransitioning(true);
    setCurrentFeaturedIndex((prev) =>
      prev === featuredPosts.length - 1 ? 0 : prev + 1,
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, featuredPosts.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || featuredPosts.length <= 1) return;
    setIsTransitioning(true);
    setCurrentFeaturedIndex((prev) =>
      prev === 0 ? featuredPosts.length - 1 : prev - 1,
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, featuredPosts.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentFeaturedIndex) return;
      setIsTransitioning(true);
      setCurrentFeaturedIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, currentFeaturedIndex],
  );

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && featuredPosts.length > 1) {
      nextSlide();
    }
    if (isRightSwipe && featuredPosts.length > 1) {
      prevSlide();
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Auto-rotate featured posts every 5 seconds (pause on hover)
  useEffect(() => {
    if (featuredPosts.length <= 1 || isCarouselPaused || isTransitioning)
      return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts.length, isCarouselPaused, isTransitioning, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (featuredPosts.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [featuredPosts.length, prevSlide, nextSlide]);

  if (!featuredPosts.length) return null;

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Featured Stories
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover my most compelling articles, handpicked for their
          insight and impact
        </p>
      </div>

      <div className="relative">
        <Card
          ref={carouselRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured stories"
          className="overflow-hidden border border-border/60 shadow-lg transition-all duration-300 group"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative h-[460px] md:h-[520px]">
            {/* Slides (fade) */}
            {featuredPosts.map((post, index) => {
              const isActive = index === currentFeaturedIndex;
              return (
                <div
                  key={post.id}
                  className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <Show when={!!post.cover}>
                    <Image
                      src={getResourceUrl(post.cover) || "/nomedia.png"}
                      alt={post.title || "Featured post"}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-cover w-full h-full transition-transform duration-[4000ms] will-change-transform ${
                        isActive ? "scale-105" : "scale-100"
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/nomedia.png";
                      }}
                    />
                  </Show>
                  <Show when={!post.cover}>
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                      <div className="text-center">
                        <Star className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Featured Article</p>
                      </div>
                    </div>
                  </Show>
                  <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/70 via-background/40 to-transparent" />
                </div>
              );
            })}

            {/* Overlay Content */}
            <div
              className={`absolute inset-0 z-20 flex flex-col justify-end pr-6 md:pr-10 pl-8 md:pl-14 pb-6 md:pb-10 transition-opacity duration-500 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex items-center gap-3 text-xs md:text-sm text-foreground drop-shadow mb-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>
                    {featuredPosts[currentFeaturedIndex]?.author?.name ||
                      featuredPosts[currentFeaturedIndex]?.author?.username}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {featuredPosts[currentFeaturedIndex]?.created_at
                      ? timeAgo(
                          featuredPosts[currentFeaturedIndex].created_at,
                        )
                      : "Unknown date"}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold leading-tight mb-3 max-w-3xl drop-shadow-sm">
                {featuredPosts[currentFeaturedIndex]?.title}
              </h3>
              <p className="text-foreground/90 max-w-2xl mb-4 line-clamp-3">
                {featuredPosts[currentFeaturedIndex]?.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {featuredPosts[currentFeaturedIndex]?.tags?.slice(0, 4).map((tag) => (
                  <ClickableTag
                    key={tag.id}
                    tag={tag}
                    variant="secondary"
                    size="sm"
                    className="hover:bg-primary/10 transition-colors"
                  />
                ))}
                {(featuredPosts[currentFeaturedIndex]?.tags?.length || 0) > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +
                    {(featuredPosts[currentFeaturedIndex]?.tags?.length || 0) - 4} more
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    router.push(
                      `/post/${createPostSlug(
                        featuredPosts[currentFeaturedIndex]?.title,
                        featuredPosts[currentFeaturedIndex]?.id,
                      )}`,
                    )
                  }
                  size="lg"
                  className="shadow-md hover:shadow-primary/20"
                >
                  Read Article
                </Button>
                <Show when={featuredPosts.length > 1}>
                  <div className="flex gap-2 items-center">
                    {featuredPosts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentFeaturedIndex
                            ? "bg-primary w-6"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-2"
                        }`}
                      />
                    ))}
                  </div>
                </Show>
              </div>
            </div>

            {/* Featured badge + nav controls */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-primary/90 text-primary-foreground border-none shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-current" /> Featured
              </Badge>
            </div>
            <Show when={featuredPosts.length > 1}>
              <div className="absolute inset-y-0 left-0 right-0 z-30 flex justify-between items-center px-2 md:px-4 pointer-events-none">
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  disabled={isTransitioning}
                  className="pointer-events-auto inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/70 backdrop-blur-sm border border-border/40 text-foreground/70 hover:text-foreground hover:bg-background transition-all disabled:opacity-40 group"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  disabled={isTransitioning}
                  className="pointer-events-auto inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/70 backdrop-blur-sm border border-border/40 text-foreground/70 hover:text-foreground hover:bg-background transition-all disabled:opacity-40 group"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </Show>
            <Show when={featuredPosts.length > 1}>
              <div className="absolute bottom-3 right-3 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-[10px] md:text-xs">
                {currentFeaturedIndex + 1} / {featuredPosts.length}
              </div>
            </Show>
            <Show when={featuredPosts.length > 1}>
              <div className="absolute bottom-4 left-4 z-30 text-xs text-muted-foreground/80 md:hidden animate-pulse">
                Swipe ▶
              </div>
            </Show>
          </div>
        </Card>
      </div>
    </div>
  );
}
