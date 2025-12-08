/**
 * CaseStudiesPage - Main page component for the Case Studies section
 * Features: search bar and magazine-style grid with all case studies
 * Each card is labeled as either "Worthwhile Development" or "Maldevelopment"
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CaseStudiesGrid from "@/components/case-studies/CaseStudiesGrid";
import CaseStudyModal from "@/components/case-studies/CaseStudyModal";
import { fetchWorthwhile, fetchMaldevelopment } from "@/api/caseStudies";
import type { CaseStudy } from "@/types/caseStudies";
import { easeOut, motion } from "framer-motion";
import "./CaseStudies.css";

// Extended CaseStudy type with segment label
type CaseStudyWithSegment = CaseStudy & {
  segment: "worthwhile" | "maldevelopment";
};

export default function CaseStudies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCaseStudies, setAllCaseStudies] = useState<CaseStudyWithSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all case studies (both worthwhile and maldevelopment)
  useEffect(() => {
    async function loadAllCaseStudies() {
      try {
        setLoading(true);
        setError(null);
        const [worthwhile, maldevelopment] = await Promise.all([
          fetchWorthwhile().catch(() => []),
          fetchMaldevelopment().catch(() => []),
        ]);

        // Combine and label each case study with its segment
        const worthwhileWithSegment: CaseStudyWithSegment[] = worthwhile.map(cs => ({
          ...cs,
          segment: "worthwhile" as const,
        }));
        const maldevelopmentWithSegment: CaseStudyWithSegment[] = maldevelopment.map(cs => ({
          ...cs,
          segment: "maldevelopment" as const,
        }));

        setAllCaseStudies([...worthwhileWithSegment, ...maldevelopmentWithSegment]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case studies");
      } finally {
        setLoading(false);
      }
    }

    loadAllCaseStudies();
  }, []);

  // Filter case studies based on search query
  const filteredCaseStudies = allCaseStudies.filter((study) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      study.name?.toLowerCase().includes(query) ||
      study.description?.toLowerCase().includes(query) ||
      study.keywords?.some((kw) => kw.toLowerCase().includes(query)) ||
      study.regions?.some((r) => r.toLowerCase().includes(query)) ||
      study.values?.some((v) => v.toLowerCase().includes(query))
    );
  });

  // Check for case study ID in URL and open modal
  useEffect(() => {
    const caseStudyId = searchParams.get("id");
    if (caseStudyId) {
      async function loadCaseStudy() {
        try {
          const [worthwhile, maldevelopment] = await Promise.all([
            fetchWorthwhile().catch(() => []),
            fetchMaldevelopment().catch(() => []),
          ]);
          const allCaseStudies = [...worthwhile, ...maldevelopment];
          const found = allCaseStudies.find((cs) => cs.id === caseStudyId);
          if (found) {
            setSelectedCaseStudy(found);
            setIsModalOpen(true);
          }
        } catch (err) {
          console.error("Failed to load case study:", err);
        }
      }
      loadCaseStudy();
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCaseStudy(null);
    // Remove id from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("id");
    setSearchParams(newSearchParams, { replace: true });
  };

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <p className="mt-4 text-gray-600">Loading case studies...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-2">Failed to load case studies.</p>
          <p className="text-gray-500">Please try again later.</p>
          {import.meta.env.DEV && (
            <p className="text-xs text-gray-400 mt-2">{error}</p>
          )}
        </div>
      );
    }

    return <CaseStudiesGrid caseStudies={filteredCaseStudies} searchQuery={searchQuery} />;
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Case Studies</h1>
        </div>
            </header>
    
            <section className="content-section">
                <div className="content-card">
                    <motion.p
                        className="simulation-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: easeOut }}
                    >
                    This tool includes a dedicated library of case studies that highlight both exemplary development practices and real-world instances of maldevelopment. These cases give users a grounded understanding of how ethical challenges unfold in practice—and how values-based, human-centered approaches can lead to better outcomes. By learning from successes and missteps alike, users of our toolkit can more confidently apply these lessons and principles to their own projects.
                    </motion.p>
                </div>
            </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
                        <input
                            type="text"
            placeholder="Search by title, keyword, region, or value…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xl border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>

        {/* Grid Content */}
        {renderContent()}
      </main>

      {/* Case Study Modal */}
      <CaseStudyModal
        caseStudy={selectedCaseStudy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
        </div>
    );
}
