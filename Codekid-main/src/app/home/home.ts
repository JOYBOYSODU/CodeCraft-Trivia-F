// home.component.ts
import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface CodeSymbol {
  char: string;
  x: number;
  delay: number;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // A property to control the visibility of the video player overlay
  isPlayerVisible: boolean = false;
  private isAutoTriggered: boolean = false;

  codeSymbols: CodeSymbol[] = [
    { char: '<>', x: 10, delay: 0 },
    { char: '{{ "{}" }}', x: 20, delay: 1 },
    { char: '[]', x: 30, delay: 2 },
    { char: '()', x: 40, delay: 3 },
    { char: ';;', x: 50, delay: 4 },
    { char: '//', x: 60, delay: 5 },
    { char: '**', x: 70, delay: 0.5 },
    { char: '++', x: 80, delay: 1.5 },
    { char: '--', x: 90, delay: 2.5 },
    { char: '&&', x: 15, delay: 3.5 },
    { char: '||', x: 25, delay: 4.5 },
    { char: '==', x: 35, delay: 5.5 }
  ];

  features: Feature[] = [
    {
      icon: '🎮',
      title: 'Game-Based Learning',
      description: 'Learn programming through fun, interactive games that make coding feel like play!'
    },
    {
      icon: '👨‍🏫',
      title: 'Expert Teachers',
      description: 'Learn from experienced instructors who know how to make coding concepts easy to understand.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Code anywhere, anytime! Our platform works perfectly on all devices.'
    },
    {
      icon: '🏆',
      title: 'Achievements',
      description: 'Earn badges and certificates as you complete challenges and master new skills.'
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Join a supportive community of young coders and share your amazing projects!'
    },
    {
      icon: '🚀',
      title: 'Real Projects',
      description: 'Build real websites, apps, and games that you can share with friends and family.'
    }
  ];

  private isBrowser: boolean = false;
  private scrollListener?: () => void;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private keydownListener?: (e: KeyboardEvent) => void;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Check if user was redirected from login to auto-play videos
    const shouldAutoPlay = localStorage.getItem('autoPlayVideos');
    if (shouldAutoPlay === 'true') {
      console.log('🎬 Auto-playing videos after login...');
      this.isAutoTriggered = true;
      // Remove the flag immediately to prevent auto-play on future visits
      localStorage.removeItem('autoPlayVideos');
      // Start videos after a short delay to ensure DOM is ready
      setTimeout(() => {
        this.startLearning();
      }, 1000);
    }

    // Initialize animations after view is ready
    setTimeout(() => {
      this.initializeAnimations();
    }, 500);

    // Add scroll listener for parallax effect
    this.scrollListener = this.onScroll.bind(this);
    window.addEventListener('scroll', this.scrollListener);

    // Add mouse move listener for hero parallax
    this.mouseMoveListener = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.mouseMoveListener);

    // Add escape key listener for closing fullscreen video
    this.keydownListener = this.onKeydown.bind(this);
    document.addEventListener('keydown', this.keydownListener);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      if (this.scrollListener) {
        window.removeEventListener('scroll', this.scrollListener);
      }
      if (this.mouseMoveListener) {
        document.removeEventListener('mousemove', this.mouseMoveListener);
      }
      if (this.keydownListener) {
        document.removeEventListener('keydown', this.keydownListener);
      }
    }
  }

  private initializeAnimations(): void {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = (index * 0.2) + 's';
      card.classList.add('animate-in');
    });
  }

  private onScroll(): void {
    const scrolled = window.pageYOffset;
    const symbols = document.querySelectorAll('.code-symbol');
    symbols.forEach((symbol, index) => {
      const speed = 0.5 + index * 0.05;
      (symbol as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
    });
  }

  private onMouseMove(e: MouseEvent): void {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    const hero = document.querySelector('.hero-section');
    if (hero) {
      const moveX = (mouseX - 0.5) * 20;
      const moveY = (mouseY - 0.5) * 20;
      (hero as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  }

  private onKeydown(e: KeyboardEvent): void {
    // Close video player when Escape key is pressed
    if (e.key === 'Escape' && this.isPlayerVisible) {
      console.log('🎬 Escape key pressed, closing video player');
      this.closePlayer();
    }
  }

  startLearning(): void {
    if (!this.isBrowser) return;
    
    console.log('🎬 Starting video player...');
    
    // Show special message for auto-triggered videos after login
    if (this.isAutoTriggered) {
      console.log('🎉 Welcome back! Enjoy your coding adventure videos...');
      this.isAutoTriggered = false; // Reset flag
    }
    
    console.log('🎬 Setting isPlayerVisible to true...');
    this.isPlayerVisible = true;
    
    // Force change detection to ensure the DOM updates
    this.cdr.detectChanges();
    console.log('🎬 Change detection forced, isPlayerVisible:', this.isPlayerVisible);

    // Use setTimeout to allow Angular to render the video elements first
    // Increased timeout to ensure DOM elements are fully rendered
    setTimeout(() => {
      console.log('🎬 Attempting to find video elements...');
      this.findAndPlayVideos();
    }, 300); // Increased timeout significantly
  }

  private findAndPlayVideos(retryCount = 0): void {
    console.log(`🔍 Searching for video elements (attempt ${retryCount + 1})...`);
    console.log('🔍 isPlayerVisible state:', this.isPlayerVisible);
    
    // Check if the video container exists first
    const videoOverlay = document.querySelector('.video-overlay');
    console.log('🔍 Video overlay element found:', !!videoOverlay);
    
    const video1 = document.getElementById('introVideo1') as HTMLVideoElement;
    const video2 = document.getElementById('introVideo2') as HTMLVideoElement;

    console.log('🎬 Video elements found:', { video1: !!video1, video2: !!video2 });
    
    // Also check the DOM structure
    const allVideos = document.querySelectorAll('video');
    console.log('🔍 All video elements in DOM:', allVideos.length);
    allVideos.forEach((video, index) => {
      console.log(`🔍 Video ${index}:`, { id: video.id, src: video.src });
    });

    if (video1 && video2) {
      // Add error handling for video loading
      video1.onerror = (e) => {
        console.error('❌ Error loading first video:', e);
        alert('Error loading video. Please check if the video file exists.');
      };

      video2.onerror = (e) => {
        console.error('❌ Error loading second video:', e);
      };

      // Add load event to ensure video is ready
      video1.onloadeddata = () => {
        console.log('✅ First video loaded successfully');
      };

      video2.onloadeddata = () => {
        console.log('✅ Second video loaded successfully');
      };

      // Start playing the first video
      video1.play().then(() => {
        console.log('🎬 First video started playing');
        // Automatically enter fullscreen for the first video
        this.enterFullscreen(video1);
      }).catch((error) => {
        console.error('❌ Error playing first video:', error);
        // Show user-friendly error message
        alert('Unable to play video. Please try again or check your browser settings.');
      });

      // Listen for when the first video ends
      video1.onended = () => {
        console.log('🎬 First video ended, starting second video');
        // Hide the first video and show the second one
        video1.style.display = 'none';
        video2.style.display = 'block';
        
        // Play the second video
        video2.play().then(() => {
          console.log('🎬 Second video started playing');
          // Automatically enter fullscreen for the second video
          this.enterFullscreen(video2);
        }).catch((error) => {
          console.error('❌ Error playing second video:', error);
        });
      };

      // When the second video ends, close the player
      video2.onended = () => {
        console.log('🎬 Both videos finished, closing player');
        // Exit fullscreen before closing
        this.exitFullscreen();
        this.closePlayer();
      };
    } else if (retryCount < 3) {
      console.log(`🔄 Video elements not found, retrying... (attempt ${retryCount + 1}/3)`);
      setTimeout(() => {
        this.findAndPlayVideos(retryCount + 1);
      }, 200);
    } else {
      console.error('❌ Video elements not found in DOM after 3 attempts');
      alert('Video player not available. Please refresh the page and try again.');
    }
  }

  // Method to close the video player
  closePlayer(): void {
    console.log('🎬 Closing video player');
    
    // Exit fullscreen before closing
    this.exitFullscreen();
    
    this.isPlayerVisible = false;
    
    // Reset video states when closing
    if (this.isBrowser) {
      setTimeout(() => {
        const video1 = document.getElementById('introVideo1') as HTMLVideoElement;
        const video2 = document.getElementById('introVideo2') as HTMLVideoElement;
        
        if (video1) {
          video1.pause();
          video1.currentTime = 0;
          video1.style.display = 'block';
        }
        
        if (video2) {
          video2.pause();
          video2.currentTime = 0;
          video2.style.display = 'none';
        }
      }, 100);
    }
  }

  // Helper method to enter fullscreen mode for video element
  private enterFullscreen(videoElement: HTMLVideoElement): void {
    if (!this.isBrowser) return;
    
    try {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen().then(() => {
          console.log('🔳 Entered fullscreen mode');
        }).catch((error) => {
          console.error('❌ Failed to enter fullscreen:', error);
        });
      } else if ((videoElement as any).webkitRequestFullscreen) {
        // Safari support
        (videoElement as any).webkitRequestFullscreen();
        console.log('🔳 Entered fullscreen mode (Safari)');
      } else if ((videoElement as any).msRequestFullscreen) {
        // IE/Edge support
        (videoElement as any).msRequestFullscreen();
        console.log('🔳 Entered fullscreen mode (IE/Edge)');
      } else {
        console.warn('⚠️ Fullscreen not supported by this browser');
      }
    } catch (error) {
      console.error('❌ Error entering fullscreen:', error);
    }
  }

  // Helper method to exit fullscreen mode
  private exitFullscreen(): void {
    if (!this.isBrowser) return;
    
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            console.log('🔲 Exited fullscreen mode');
          }).catch((error) => {
            console.error('❌ Failed to exit fullscreen:', error);
          });
        } else if ((document as any).webkitExitFullscreen) {
          // Safari support
          (document as any).webkitExitFullscreen();
          console.log('🔲 Exited fullscreen mode (Safari)');
        } else if ((document as any).msExitFullscreen) {
          // IE/Edge support
          (document as any).msExitFullscreen();
          console.log('🔲 Exited fullscreen mode (IE/Edge)');
        }
      }
    } catch (error) {
      console.error('❌ Error exiting fullscreen:', error);
    }
  }

  // Helper method to get safe animation delay
  getAnimationDelay(index: number): string {
    return `${index * 0.2}s`;
  }
}
