import { useEffect } from "react";

/**
 * Custom hook to update document title and meta tags for SEO
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.keywords - Meta keywords (optional)
 */
const useSEO = ({ title, description, keywords }) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title
      ? `${title} | StudySphere`
      : "StudySphere | Find Expert Tutors for Online & Offline Learning";
    document.title = fullTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute("content", fullTitle);
    }

    // Update Open Graph description
    const ogDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    if (ogDescription && description) {
      ogDescription.setAttribute("content", description);
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title) {
      twitterTitle.setAttribute("content", fullTitle);
    }

    // Update Twitter description
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]',
    );
    if (twitterDescription && description) {
      twitterDescription.setAttribute("content", description);
    }
  }, [title, description, keywords]);
};

export default useSEO;
