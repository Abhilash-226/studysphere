import React from "react";
import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import HowItWorks from "./HowItWorks";
import TutorsSection from "./TutorsSection";
import TutorCTA from "./TutorCTA";
import "./HomePage.css";

const HomePage = () => {
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
