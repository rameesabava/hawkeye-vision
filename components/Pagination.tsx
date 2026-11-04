"use client";

import React from "react";

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronsLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </svg>
  );
}

function ChevronsRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  variant?: "white" | "admin" | "dark";
  className?: string;
  scrollToId?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = "items",
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  variant = "white",
  className = "",
  scrollToId,
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (itemsPerPage || 6))) {
    if (!totalItems || totalItems === 0) return null;
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollToId) {
      const element = document.getElementById(scrollToId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  // Item counts
  const effectivePerPage = itemsPerPage || pageSize || 6;
  const startItem = totalItems ? Math.min((currentPage - 1) * effectivePerPage + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(currentPage * effectivePerPage, totalItems) : 0;

  // Variant styling
  const isDark = variant === "dark";
  const containerBg = isDark
    ? "bg-slate-900/90 border-white/10 text-slate-200"
    : "bg-white border-blue-100 text-slate-700 shadow-sm";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const buttonBorder = isDark ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-blue-50/70";
  const activeBtn = "bg-[#081F4D] text-white shadow-sm ring-2 ring-[#081F4D]/20";
  const inactiveBtn = isDark
    ? "text-slate-300 hover:bg-white/10 hover:text-white"
    : "text-slate-700 hover:bg-blue-50 hover:text-[#081F4D]";

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row ${containerBg} ${className}`}
    >
      {/* Left: Summary & Per-Page selector */}
      <div className="flex flex-wrap items-center gap-3">
        {totalItems !== undefined && (
          <span className={`text-xs font-medium ${textMuted}`}>
            Showing <strong className={isDark ? "text-white" : "text-[#081F4D]"}>{startItem}–{endItem}</strong> of{" "}
            <strong className={isDark ? "text-white" : "text-[#081F4D]"}>{totalItems}</strong> {itemName}
          </span>
        )}

        {pageSizeOptions && onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className={textMuted}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={`rounded-lg border px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#081F4D]/20 ${
                isDark
                  ? "border-white/20 bg-slate-800 text-white"
                  : "border-slate-200 bg-slate-50 text-[#081F4D]"
              }`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First Page"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-30 ${buttonBorder} ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-30 ${buttonBorder} ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 px-1">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className={`flex h-8 w-7 items-center justify-center text-xs font-bold ${textMuted}`}
                  >
                    …
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                    isActive ? activeBtn : inactiveBtn
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-30 ${buttonBorder} ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last Page"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-30 ${buttonBorder} ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
