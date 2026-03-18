"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    author: "E.H.",
    role: "Aspiring café owner, San Francisco",
    rating: 5,
    text: "I used the Benchmark mode to see if my neighborhood even needed another coffee shop. It showed me a gap in \"early morning commuters\" that none of the other shops are targeting well. I used the Campaign Generator to draft what my first month of ads would look like. It finally feels real.",
  },
  {
    id: "2",
    author: "X.Z.",
    role: "Gym owner, San Francisco",
    rating: 5,
    text: "As a small business without a dedicated marketing team, it makes targeting the right customers much easier. The platform helps us reach local people interested in fitness and group classes. We've used it to promote free trial classes and membership discounts — the setup is simple and intuitive.",
  },
  {
    id: "3",
    author: "Anonymous",
    role: "Aspiring photographer, Burlingame",
    rating: 5,
    text: "I've been using the Teach-Me consultation flow, and it's like taking a business masterclass while you work. The follow-up suggestions always make me think about my future business from an angle I never considered. It's given me the confidence to actually set a launch date.",
  },
  {
    id: "4",
    author: "Raghav",
    role: "Hair products, San Francisco",
    rating: 5,
    text: "I honestly didn't expect much when I first tried the campaign generation tool, but wow, I was wrong! The AI actually understood what I was going for. The image it generated looked like something a professional creative agency would produce. It's rare to find a tool that just works right out of the box.",
  },
  {
    id: "5",
    author: "K.C.",
    role: "Pre-launch business, San Francisco",
    rating: 5,
    text: "Starting a business is overwhelming, but the action plan feature makes it manageable. It tells me exactly what to do each day — post this, email that, check this. I just copy the generated copy and I'm done. It's the only way I've stayed consistent while still in the pre-launch phase.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i <= count ? "currentColor" : "none"}
          stroke={i <= count ? "none" : "currentColor"}
          strokeWidth={1.2}
          className={`h-4 w-4 ${i <= count ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-600"}`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
      aria-label={`Scroll ${direction}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        {direction === "left" ? (
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        )}
      </svg>
    </button>
  );
}

export default function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("landing");

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="border-y border-zinc-100 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t("testimonialLabel")}
            </h2>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t("testimonialTitle")}
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <ArrowButton direction="left" onClick={() => scroll("left")} />
            <ArrowButton direction="right" onClick={() => scroll("right")} />
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {TESTIMONIALS.map((review) => (
              <div
                key={review.id}
                className="w-80 shrink-0 snap-start rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Stars count={review.rating} />
                <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {review.author}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {review.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2 sm:hidden">
            <ArrowButton direction="left" onClick={() => scroll("left")} />
            <ArrowButton direction="right" onClick={() => scroll("right")} />
          </div>
        </div>
      </div>
    </section>
  );
}
