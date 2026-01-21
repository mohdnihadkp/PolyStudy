
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  format?: 'native' | 'leaderboard';
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ format = 'native', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous ads to prevent duplication
    containerRef.current.innerHTML = '';

    if (format === 'leaderboard') {
        // Desktop: 728x90 Iframe Ad
        const iframe = document.createElement('iframe');
        iframe.style.width = '728px';
        iframe.style.height = '90px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';
        
        const docContent = `
            <html>
            <body style="margin:0;padding:0;background:transparent;">
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
        
        try {
            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(docContent);
                doc.close();
            }
        } catch (e) {
            console.error("Ad iframe error", e);
        }

    } else {
        // Native Ad (Responsive Div)
        const adDiv = document.createElement('div');
        adDiv.id = 'container-3d99cb72fd857aed0f3dd230c2761458';
        containerRef.current.appendChild(adDiv);

        const script = document.createElement('script');
        script.src = 'https://remotelydependedchance.com/3d99cb72fd857aed0f3dd230c2761458/invoke.js';
        script.async = true;
        script.dataset.cfasync = "false";
        containerRef.current.appendChild(script);
    }
  }, [format]);

  // Strict Sizing Logic:
  // Mobile (<768px): Container 320px x 50px. Content (728x90) scaled down (0.44x).
  // Desktop (>=768px): Container 728px x 90px. Content full size.
  
  // Wrapper defines the space occupied on the page
  const wrapperClass = format === 'leaderboard' 
    ? "relative overflow-hidden w-[320px] h-[50px] md:w-[728px] md:h-[90px] transition-all duration-300 ease-in-out bg-black/5 dark:bg-white/5 rounded-lg"
    : "w-full min-h-[50px] flex justify-center items-center";

  // Content defines the transformation of the inner ad code
  const contentClass = format === 'leaderboard'
    ? "absolute top-1/2 left-1/2 w-[728px] h-[90px] -translate-x-1/2 -translate-y-1/2 origin-center transform scale-[0.44] md:scale-100 transition-transform duration-300 ease-in-out flex items-center justify-center"
    : "w-full flex justify-center";

  return (
    <div className={`flex justify-center w-full ${className} animate-fade-in`}>
        <div className={wrapperClass}>
            <div ref={containerRef} className={contentClass}></div>
        </div>
    </div>
  );
};

export default AdBanner;
