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

  const updateVideoOnScroll = () => {
    if (!isVideoLoaded) {
      ticking = false;
      return;
    }

    const heroRect = heroSection.getBoundingClientRect();
    const heroHeight = heroSection.offsetHeight;
    
    // Calculate scroll progress through the hero section
    // 0 = top of hero is at top of viewport
    // 1 = bottom of hero is at top of viewport
    
    let scrollPercent = 0;
    
    if (heroRect.top <= 0) {
      // Scrolled past the top of the hero
      scrollPercent = Math.abs(heroRect.top) / heroHeight;
    }
    
    // Clamp between 0 and 1
    scrollPercent = Math.max(0, Math.min(1, scrollPercent));
    
    // Map scroll percentage to video time
    if (heroVideo.duration && !isNaN(heroVideo.duration)) {
      heroVideo.currentTime = scrollPercent * heroVideo.duration;
    }
    
    // Parallax effect for hero content
    if (heroContent) {
      const yOffset = scrollPercent * heroHeight * 0.4; // Moves at 40% speed of scroll
      const opacity = 1 - (scrollPercent * 1.5);
      
      heroContent.style.transform = `translateY(${yOffset}px)`;
      heroContent.style.opacity = Math.max(0, opacity);
    }
    
    ticking = false;
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
