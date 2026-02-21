import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  codeSymbols = [
    { char: '<>', x: 10, delay: 0 },
    { char: '{}', x: 20, delay: 1 },
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

  features = [
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
          (card as HTMLElement).style.animationDelay = (index * 0.2) + 's';
          card.classList.add('cardSlideIn');
        });
      }, 500);

      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const symbols = document.querySelectorAll('.code-symbol');
        symbols.forEach((symbol, index) => {
          const speed = 0.5 + index * 0.1;
          (symbol as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
        });
      });

      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        const hero = document.querySelector('.hero-section');
        if (hero) {
          const moveX = (mouseX - 0.5) * 20;
          const moveY = (mouseY - 0.5) * 20;
          (hero as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
    }
  }

  startLearning(): void {
    if (isPlatformBrowser(this.platformId)) {
      const button = document.querySelector('.cta-button') as HTMLElement;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
      alert('Welcome to CodeKid! Your coding adventure is about to begin! 🚀');
    }
  }
}
