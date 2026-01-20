import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  format?: 'banner' | 'native' | 'leaderboard'; // banner = 320x50, native = feed/box style, leaderboard = 728x90
  className?: string;
  slot?: string; // Kept for backwards compatibility but not used
}

const AdBanner: React.FC<AdBannerProps> = ({ format = 'native', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container to prevent duplicate injections on re-renders
    containerRef.current.innerHTML = '';

    if (format === 'banner') {
      // 320x50 Banner (Code A)
      const iframe = document.createElement('iframe');
      iframe.style.width = '320px';
      iframe.style.height = '50px';
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
              'key' : '4d14f8ed21408146f8235e7f187db494',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://remotelydependedchance.com/4d14f8ed21408146f8235e7f187db494/invoke.js"></script>
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

    } else if (format === 'leaderboard') {
      // 728x90 Leaderboard Placeholder
      // Note: Replace this with actual ad network code when available.
      const div = document.createElement('div');
      div.style.width = '728px';
      div.style.height = '90px';
      div.className = 'flex items-center justify-center bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-lg text-slate-400 dark:text-slate-500 font-bold text-sm tracking-widest uppercase';
      div.innerText = 'Ad Space 728x90';
      containerRef.current.appendChild(div);
      
    } else {
      // Native Banner (Code B)
      const adDiv = document.createElement('div');
      adDiv.id = 'container-3d99cb72fd857aed0f3dd230c2761458';
      containerRef.current.appendChild(adDiv);

      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = 'https://pl28274651.effectivegatecpm.com/3d99cb72fd857aed0f3dd230c2761458/invoke.js';
      containerRef.current.appendChild(script);
    }
  }, [format]);

  return (
    <div className={`flex justify-center items-center my-4 ${className} animate-fade-in`}>
      <div className="relative bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm group">
         {/* Subtle "Sponsored" Label */}
         <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-slate-200 dark:bg-neutral-800 text-[8px] font-bold text-slate-500 dark:text-neutral-500 rounded-br-lg z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            AD
         </div>
         <div ref={containerRef} className="flex justify-center items-center min-h-[50px] min-w-[300px]" />
      </div>
    </div>
  );
};

export default AdBanner;
