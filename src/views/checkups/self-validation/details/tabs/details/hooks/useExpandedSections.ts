import { useCallback, useState } from 'react';

/**
 * Hook to manage expanded/collapsed state for sections
 */
export const useExpandedSections = (): {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
} => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return { expandedSections, toggleSection };
};
