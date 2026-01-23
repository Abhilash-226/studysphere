import React from "react";
import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import HowItWorks from "./HowItWorks";
import TutorsSection from "./TutorsSection";
import TutorCTA from "./TutorCTA";
import useSEO from "../../hooks/useSEO";
import "./HomePage.css";

const HomePage = () => {
  useSEO({
    title: "Find Expert Tutors for Online & Offline Learning",
    description:
      "StudySphere connects students with expert tutors for personalized online and offline learning. Find quality coaching classes, book sessions, and achieve your academic goals.",
    keywords:
      "tutoring, online learning, offline classes, coaching, education, tutors, students, StudySphere",
  });

  return (
    <div className="home-page">
      <HeroSection />
      <CategoriesSection />
      <HowItWorks />
      <TutorsSection />
      <TutorCTA />
      {/* Add more sections here as needed */}
    </div>
  );
};

export default HomePage;
