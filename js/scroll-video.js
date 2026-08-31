// Scroll-synced video controller

document.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.getElementById('heroVideo');
  const heroSection = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  
  if (!heroVideo || !heroSection) return;

  // Ensure video is paused
  heroVideo.pause();

  let isVideoLoaded = false;
  
  heroVideo.addEventListener('loadedmetadata', () => {
    isVideoLoaded = true;
    heroVideo.pause(); // Just to be sure
  });

  // Preload video if possible
  if (heroVideo.readyState >= 1) {
    isVideoLoaded = true;
  }

  let ticking = false;

    let targetTime = 0;
    
    // Lerp state
    if (typeof window.videoLerpState === 'undefined') {
      window.videoLerpState = {
        currentTime: 0,
        animating: false
      };
    }

    const updateVideoOnScroll = () => {
      if (!isVideoLoaded || !heroVideo.duration) return;

      const heroRect = heroSection.getBoundingClientRect();
      // Total scrollable distance is hero height - viewport height
      const maxScroll = heroSection.offsetHeight - window.innerHeight;
      
      let scrollPercent = 0;
      if (heroRect.top < 0) {
        scrollPercent = Math.abs(heroRect.top) / maxScroll;
      }
      
      scrollPercent = Math.max(0, Math.min(1, scrollPercent));
      targetTime = scrollPercent * heroVideo.duration;

      // Parallax effect for hero content
      if (heroContent) {
        // Content fades and moves up faster
        const yOffset = scrollPercent * window.innerHeight * 0.8;
        const opacity = 1 - (scrollPercent * 3);
        
        heroContent.style.transform = `translateY(${yOffset}px)`;
        heroContent.style.opacity = Math.max(0, opacity);
      }
      
      if (!window.videoLerpState.animating) {
        window.videoLerpState.animating = true;
        requestAnimationFrame(lerpVideo);
      }
      
      ticking = false;
    };

    const lerpVideo = () => {
      const diff = targetTime - window.videoLerpState.currentTime;
      // Smoothly approach the target time (adjust 0.1 for more/less smoothing)
      window.videoLerpState.currentTime += diff * 0.1;
      
      // Apply to video
      if (Math.abs(diff) > 0.01) {
        heroVideo.currentTime = window.videoLerpState.currentTime;
        requestAnimationFrame(lerpVideo);
      } else {
        window.videoLerpState.animating = false;
      }
    };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateVideoOnScroll);
      ticking = true;
    }
  });

  // Initial update
  updateVideoOnScroll();
});
