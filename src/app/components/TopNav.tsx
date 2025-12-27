import { BookOpen, Menu, X, Github, HelpCircle } from "lucide-react";
import { Highlighter } from "./Highlighter";
import { useState } from "react";

/**
 * TopNav Component - Fixed navigation bar
 * Responsive behavior:
 * - Mobile (<640px): Compact logo, hamburger menu
 * - Tablet (641-1024px): Full logo, inline menu items
 * - Desktop (>1024px): Full logo, expanded menu with additional items
 */
export function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title - Scales responsively */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl font-bold whitespace-nowrap">
              <Highlighter color="blue">
                <span className="hidden sm:inline">Options Strategy Builder</span>
                <span className="sm:hidden">OSB</span>
              </Highlighter>
            </h1>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a
              href="#strategies"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2"
              aria-label="View strategies"
            >
              Strategies
            </a>
            <a
              href="#learn"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2"
              aria-label="Learn more"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
                <span>Learn</span>
              </span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-3 py-2"
              aria-label="View on GitHub"
            >
              <Github className="w-5 h-5" strokeWidth={2.5} />
            </a>
          </div>

          {/* Mobile Menu Button - Shown only on small screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Mobile Menu - Slides down on mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-2" role="menu">
              <a
                href="#strategies"
                className="text-gray-700 hover:bg-gray-100 transition-colors text-base font-medium px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Strategies
              </a>
              <a
                href="#learn"
                className="text-gray-700 hover:bg-gray-100 transition-colors text-base font-medium px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
                <span>Learn</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:bg-gray-100 transition-colors text-base font-medium px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="w-4 h-4" strokeWidth={2.5} />
                <span>GitHub</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}