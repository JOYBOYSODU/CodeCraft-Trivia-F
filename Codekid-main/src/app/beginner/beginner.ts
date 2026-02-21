// beginner.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../services/progress.service';
import { Subscription } from 'rxjs';

interface Level {
  id: number;
  title: string;
  description: string;
  path: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  completed: boolean;
}

@Component({
  selector: 'app-beginner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './beginner.html',
  styleUrls: ['./beginner.css']
})
export class BeginnerComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private progressService: ProgressService
  ) {}

  levels: Level[] = [
    {
      id: 1,
      title: 'Level 1',
      description: 'Learn what HTML is and create your first webpage with basic structure',
      path: '/beginner/lesson1',
      difficulty: 'easy',
      topics: ['HTML Basics', 'Document Structure', '<html>', '<head>', '<body>'],
      completed: false
    },
    {
      id: 2,
      title: 'Level 2',
      description: 'Master headings and paragraphs to organize your content',
      path: '/beginner/lesson2',
      difficulty: 'easy',
      topics: ['Headings', 'Paragraphs', '<h1>-<h6>', '<p>'],
      completed: false
    },
    {
      id: 3,
      title: 'Level 3',
      description: 'Add style to your text with formatting tags',
      path: '/beginner/lesson3',
      difficulty: 'easy',
      topics: ['Text Formatting', '<strong>', '<em>', '<u>', '<br>'],
      completed: false
    },
    {
      id: 4,
      title: 'Level 4',
      description: 'Organize information using different types of lists',
      path: '/beginner/lesson4',
      difficulty: 'medium',
      topics: ['Lists', '<ul>', '<ol>', '<li>', 'Nested Lists'],
      completed: false
    },
    {
      id: 5,
      title: 'Level 5',
      description: 'Add images and links to make your webpage interactive',
      path: '/beginner/lesson5',
      difficulty: 'medium',
      topics: ['Images', 'Links', '<img>', '<a>', 'Attributes'],
      completed: false
    },
    {
      id: 6,
      title: 'Level 6',
      description: 'Create tables to display data in rows and columns',
      path: '/beginner/lesson6',
      difficulty: 'medium',
      topics: ['Tables', '<table>', '<tr>', '<td>', '<th>'],
      completed: false
    },
    {
      id: 7,
      title: 'Level 7',
      description: 'Build forms to collect user input and information',
      path: '/beginner/lesson7',
      difficulty: 'hard',
      topics: ['Forms', '<form>', '<input>', '<button>', 'Form Controls'],
      completed: false
    },
    {
      id: 8,
      title: 'Level 8',
      description: 'Learn semantic HTML and create a complete webpage',
      path: '/beginner/lesson8',
      difficulty: 'hard',
      topics: ['Semantic HTML', '<header>', '<nav>', '<main>', '<footer>'],
      completed: false
    }
  ];

  ngOnInit() {
    // Subscribe to progress changes
    this.subscription.add(
      this.progressService.progress$.subscribe(completedLessons => {
        this.updateLevelCompletionStatus(completedLessons);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Update level completion status based on progress service
  private updateLevelCompletionStatus(completedLessons: number[]) {
    this.levels.forEach(level => {
      level.completed = completedLessons.includes(level.id);
    });
  }

selectedLevel: any;

  trackByLevelId(index: number, level: Level): number {
    return level.id;
  }

  selectLevel(level: Level) {
    if (this.isLevelLocked(level)) {
      alert('🔒 This level is locked! Complete the previous levels first.');
      return;
    }
    
    console.log('Navigating to', level.path);
    this.router.navigate([level.path]);
  }

  isLevelLocked(level: Level): boolean {
    return !this.progressService.isLessonUnlocked(level.id);
  }

  getCompletedCount(): number {
    return this.levels.filter(level => level.completed).length;
  }

  getProgressPercentage(): number {
    return Math.round((this.getCompletedCount() / this.levels.length) * 100);
  }

  // Method to mark a level as completed (call this when user completes a level)
  markLevelCompleted(levelId: number) {
    this.progressService.completeLesson(levelId);
    this.showCompletionMessage(levelId);
  }

  // Show completion message and next level availability
  private showCompletionMessage(completedLevelId: number) {
    const nextLevel = this.levels.find(l => l.id === completedLevelId + 1);
    
    if (nextLevel) {
      setTimeout(() => {
        alert(`🎉 Congratulations! Level ${completedLevelId} completed!\n🔓 Level ${nextLevel.id} is now unlocked!`);
      }, 500);
    } else {
      setTimeout(() => {
        alert(`🏆 Amazing! You've completed Level ${completedLevelId}!\n👑 You've finished all beginner levels!`);
      }, 500);
    }
  }

  // Reset all progress (for testing purposes)
  resetProgress() {
    this.progressService.resetProgress();
    console.log('🔄 All progress reset!');
  }
}