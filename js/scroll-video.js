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

      // Parallax effect and scene transitions
      const scene1 = document.getElementById('scene1');
      const scene2 = document.getElementById('scene2');
      const scene3 = document.getElementById('scene3');
      const scene4 = document.getElementById('scene4');
      
      if (scene1) {
        // Scene 1: 0% to 25%
        if (scrollPercent < 0.25) {
          const progress = scrollPercent / 0.25;
          scene1.style.opacity = 1 - progress;
          scene1.style.transform = `translateY(${progress * -100}px)`;
        } else {
          scene1.style.opacity = 0;
        }
      }
      
      const updateScene = (scene, start, end) => {
        if (!scene) return;
        if (scrollPercent >= start && scrollPercent < end) {
          // Fade in first half, fade out second half
          const mid = start + (end - start) / 2;
          let opacity = 0;
          let y = 50;
          
          if (scrollPercent < mid) {
            // Fade in
            const progress = (scrollPercent - start) / (mid - start);
            opacity = progress;
            y = 50 - (progress * 50);
          } else {
            // Fade out
            const progress = (scrollPercent - mid) / (end - mid);
            opacity = 1 - progress;
            y = -(progress * 50);
          }
          scene.style.opacity = opacity;
          scene.style.transform = `translateY(${y}px)`;
        } else {
          scene.style.opacity = 0;
        }
      };

      updateScene(scene2, 0.20, 0.50);
      updateScene(scene3, 0.45, 0.75);
      
      if (scene4) {
        // Scene 4: 0.70 to 1.0
        if (scrollPercent >= 0.70) {
          const progress = Math.min(1, (scrollPercent - 0.70) / 0.20);
          scene4.style.opacity = progress;
          scene4.style.transform = `translateY(${50 - (progress * 50)}px)`;
        } else {
          scene4.style.opacity = 0;
        }
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
