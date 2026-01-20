import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  format?: 'native' | 'leaderboard';
  className?: string;
  slot?: string; 
}

const AdBanner: React.FC<AdBannerProps> = ({ format = 'native', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container to prevent duplicate injections on re-renders
    containerRef.current.innerHTML = '';

    if (format === 'leaderboard') {
      // 728x90 Leaderboard (Iframe encapsulation for safety)
      const iframe = document.createElement('iframe');
      iframe.style.width = '728px';
      iframe.style.height = '90px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      
      const docContent = `
        <!DOCTYPE html>
        <html>
        <head><base target="_blank" /></head>
        <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
          <script type="text/javascript">
            atOptions = {
              'key' : '3ce504c3e574a4c5abd28e98b3e0f102',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://remotelydependedchance.com/3ce504c3e574a4c5abd28e98b3e0f102/invoke.js"></script>
        </body>
        </html>
      `;

      containerRef.current.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(docContent);
        iframeDoc.close();
      }

    } else {
      // Native Banner
      // Using a wrapper to ensure unique-ish behavior if possible, 
      // though the script targets a specific ID.
      const adDiv = document.createElement('div');
      adDiv.id = 'container-3d99cb72fd857aed0f3dd230c2761458';
      containerRef.current.appendChild(adDiv);

      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = 'https://remotelydependedchance.com/3d99cb72fd857aed0f3dd230c2761458/invoke.js';
      containerRef.current.appendChild(script);
    }
  }, [format]);

  // Height mapping for responsive containers to prevent layout shift/whitespace
  const heightClass = format === 'leaderboard' 
    ? 'h-[40px] sm:h-[68px] md:h-[90px]' // Scaled heights: 90*0.45, 90*0.75, 90*1
    : 'min-h-[50px]'; // Native ads are dynamic

  const scaleClass = format === 'leaderboard'
    ? 'scale-[0.42] sm:scale-75 md:scale-100 origin-top' // Scale factors
    : '';

  return (
    <div className={`flex justify-center items-center my-4 w-full ${className} animate-fade-in`}>
      <div className={`relative bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm group ${heightClass} transition-all duration-300`}>
         {/* Subtle "Sponsored" Label */}
         <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-slate-200 dark:bg-neutral-800 text-[8px] font-bold text-slate-500 dark:text-neutral-500 rounded-br-lg z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            AD
         </div>
         <div 
            ref={containerRef} 
            className={`flex justify-center items-start ${scaleClass}`}
         />
      </div>
    </div>
  );
};

export default AdBanner;
