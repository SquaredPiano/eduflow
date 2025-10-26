import Footer from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero-section";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  const title = "EduFlow - AI-Powered Learning Platform";
  const description =
    "Transform your educational content with AI-powered transcription, notes, flashcards, and more. Import from Canvas LMS and visualize your learning flow.";
  const keywords = "EduFlow, AI Learning, Education, Canvas LMS, Transcription, Flashcards, Study Notes, AI Education";
  const siteUrl = "https://eduflow.app/";
  const imageUrl = "/logo.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "EduFlow" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "EduFlow Team" },
    { name: "favicon", content: "/logo.png" },
  ];
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Footer />
    </>
  );
}
