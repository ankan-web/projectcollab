import { useEffect } from "react";

export default function GlobalResponsiveStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Global Mobile Responsive Styles */
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }
      
      html {
        font-size: 16px;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #09090b;
        color: #fff;
        overflow-x: hidden;
      }
      
      /* Container with responsive padding */
      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }
      
      /* Responsive grid */
      .responsive-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
      
      /* Card styles */
      .responsive-card {
        background: #111113;
        border: 0.5px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 20px;
        transition: all 0.15s;
      }
      
      .responsive-card:hover {
        border-color: rgba(255,255,255,0.15);
      }
      
      /* Page header */
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      
      .page-title {
        font-family: 'Syne', sans-serif;
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        margin: 0;
        letter-spacing: -0.3px;
      }
      
      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 10px;
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        text-decoration: none;
      }
      
      .btn-primary {
        background: #63ffb4;
        color: #09090b;
      }
      
      .btn-secondary {
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: 0.5px solid rgba(255,255,255,0.1);
      }
      
      /* Responsive tables */
      .responsive-table {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .responsive-table table {
        width: 100%;
        min-width: 600px;
      }
      
      /* Hide on mobile */
      .hide-mobile {
        display: block;
      }
      
      /* Show on mobile only */
      .show-mobile-only {
        display: none;
      }
      
      /* Mobile menu button */
      .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: #fff;
        padding: 8px;
        cursor: pointer;
      }
      
      /* Responsive navbar */
      .responsive-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 58px;
        padding: 0 20px;
        gap: 16px;
      }
      
      .responsive-nav-links {
        display: flex;
        gap: 8px;
      }
      
      /* Responsive search */
      .responsive-search {
        position: relative;
      }
      
      .responsive-search-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 340px;
        z-index: 100;
      }
      
      /* Floating action button for mobile */
      .fab {
        display: none;
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #63ffb4;
        color: #09090b;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(99,255,180,0.3);
        align-items: center;
        justify-content: center;
      }
      
      /* Responsive Modal */
      .responsive-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }
      
      .responsive-modal-content {
        background: #18181b;
        border: 0.5px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 24px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      /* Badge */
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 6px;
        background: #ff5555;
        color: #fff;
        font-size: 10px;
        font-weight: 600;
        border-radius: 9px;
      }
      
      /* Tabs */
      .tabs {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: rgba(255,255,255,0.04);
        border-radius: 10px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .tab {
        flex: 1;
        min-width: max-content;
        padding: 10px 16px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.5);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      
      .tab.active {
        background: rgba(99,255,180,0.15);
        color: #63ffb4;
      }
      
      /* Chip / Pill */
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        background: rgba(99,255,180,0.1);
        color: #63ffb4;
        border: 0.5px solid rgba(99,255,180,0.25);
      }
      
      /* =========================================
         MEDIA QUERIES
         ========================================= */
      
      /* Tablet Portrait */
      @media (max-width: 1024px) {
        .container {
          padding: 0 16px;
        }
        
        .responsive-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .page-title {
          font-size: 22px;
        }
      }
      
      /* Mobile Landscape & Tablet Portrait */
      @media (max-width: 768px) {
        html {
          font-size: 15px;
        }
        
        body {
          -webkit-font-smoothing: antialiased;
        }
        
        .container {
          padding: 0 12px;
        }
        
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        
        .page-title {
          font-size: 20px;
        }
        
        .responsive-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .responsive-card {
          padding: 16px;
          border-radius: 12px;
        }
        
        /* Hide desktop nav links */
        .hide-mobile {
          display: none !important;
        }
        
        /* Show mobile menu button */
        .show-mobile-only {
          display: flex !important;
        }
        
        .mobile-menu-btn {
          display: flex !important;
        }
        
        .btn {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
        }
        
        .btn-primary, .btn-secondary {
          width: 100%;
        }
        
        .tabs {
          padding: 3px;
          border-radius: 8px;
        }
        
        .tab {
          padding: 8px 12px;
          font-size: 12px;
        }
        
        .responsive-search-dropdown {
          position: fixed;
          top: 58px;
          left: 0;
          right: 0;
          width: 100%;
          max-width: none;
          border-radius: 0;
        }
        
        /* Responsive navbar mobile */
        .responsive-nav {
          padding: 0 12px;
        }
        
        .responsive-nav-links {
          display: none;
          position: fixed;
          top: 58px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #09090b;
          flex-direction: column;
          padding: 16px;
          gap: 8px;
          z-index: 99;
        }
        
        .responsive-nav-links.open {
          display: flex;
        }
        
        .responsive-nav-links a,
        .responsive-nav-links button {
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 16px;
        }
        
        /* Floating action button */
        .fab {
          display: flex;
        }
        
        /* Form elements */
        input, textarea, select {
          font-size: 16px !important; /* Prevent iOS zoom */
        }
        
        /* Modal adjustments */
        .responsive-modal-content {
          padding: 20px;
          border-radius: 12px;
          margin: 12px;
        }
        
        /* Table scroll */
        .responsive-table {
          margin: 0 -12px;
          padding: 0 12px;
        }
        
        /* Stats cards */
        .stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        
        /* Avatar */
        .avatar {
          width: 40px !important;
          height: 40px !important;
        }
      }
      
      /* Very small screens */
      @media (max-width: 400px) {
        .stats-grid {
          grid-template-columns: 1fr !important;
        }
        
        .page-title {
          font-size: 18px;
        }
      }
      
      /* Large Desktop */
      @media (min-width: 1200px) {
        .container {
          padding: 0 32px;
        }
        
        .responsive-grid {
          gap: 20px;
        }
      }
      
      /* Prevent horizontal scroll */
      html, body {
        overflow-x: hidden;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Touch improvements */
      @media (hover: none) {
        button, a, .clickable {
          -webkit-tap-highlight-color: rgba(255,255,255,0.1);
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
}