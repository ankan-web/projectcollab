export const MOBILE_BREAKPOINT = 768;

export const useMediaQuery = (query) => {
  if (typeof window === 'undefined') return false;
  return window.matchQuery && window.matchQuery(query);
};

export const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    width: '100%',
  },
  grid: {
    display: 'grid',
    gap: 16,
  },
  flex: {
    display: 'flex',
    gap: 16,
  },
  card: {
    background: '#111113',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
  },
};

export const responsive = (mobileStyles, desktopStyles) => ({
  ...mobileStyles,
  ...desktopStyles,
});

export const mediaQuery = (type) => {
  return `@media (${type === 'mobile' ? 'max-width' : 'min-width'}: ${MOBILE_BREAKPOINT}px)`;
};

export const shellStyles = `
  .responsive-shell {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }
  
  .responsive-grid {
    display: grid;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    .responsive-shell {
      padding: 0 12px;
    }
    
    .responsive-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

export const getResponsiveStyles = (mobile, tablet, desktop) => {
  return `
    .page-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .page-title {
      font-family: 'Syne', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      margin: 0;
    }
    
    .responsive-grid {
      display: grid;
      gap: 16px;
    }
    
    .responsive-card {
      background: #111113;
      border: 0.5px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 20px;
    }
    
    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    
    .btn-primary {
      background: #63ffb4;
      color: #09090b;
    }
    
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      color: #fff;
    }
    
    /* Tablet */
    @media (max-width: 1024px) {
      .page-container {
        padding: 0 12px;
      }
      
      .responsive-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Mobile */
    @media (max-width: 768px) {
      .page-container {
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
      }
      
      .responsive-card {
        padding: 16px;
        border-radius: 12px;
      }
      
      .btn {
        width: 100%;
        text-align: center;
      }
      
      .hide-mobile {
        display: none !important;
      }
    }
    
    /* Large Desktop */
    @media (min-width: 1200px) {
      .page-container {
        padding: 0 32px;
      }
      
      .responsive-grid {
        gap: 20px;
      }
    }
  `;
};