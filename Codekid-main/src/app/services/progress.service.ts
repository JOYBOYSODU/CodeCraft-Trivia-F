import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private progressSubject = new BehaviorSubject<number[]>([]);
  public progress$ = this.progressSubject.asObservable();

  constructor() {
    this.loadProgress();
  }

  // Get completed lesson IDs
  getCompletedLessons(): number[] {
    return this.progressSubject.value;
  }

  // Mark a lesson as completed
  completeLesson(lessonId: number): void {
    const currentProgress = this.progressSubject.value;
    if (!currentProgress.includes(lessonId)) {
      const newProgress = [...currentProgress, lessonId].sort((a, b) => a - b);
      this.progressSubject.next(newProgress);
      this.saveProgress();
      console.log(`✅ Lesson ${lessonId} completed! Progress:`, newProgress);
    }
  }

  // Check if a lesson is completed
  isLessonCompleted(lessonId: number): boolean {
    return this.progressSubject.value.includes(lessonId);
  }

  // Check if a lesson is unlocked (previous lesson completed or it's lesson 1)
  isLessonUnlocked(lessonId: number): boolean {
    if (lessonId === 1) return true; // First lesson is always unlocked
    return this.isLessonCompleted(lessonId - 1);
  }

  // Get next unlocked lesson
  getNextUnlockedLesson(): number {
    const completed = this.progressSubject.value;
    if (completed.length === 0) return 1; // Start with lesson 1

    const maxCompleted = Math.max(...completed);
    return Math.min(maxCompleted + 1, 8); // Max 8 lessons
  }

  // Reset all progress
  resetProgress(): void {
    this.progressSubject.next([]);
    localStorage.removeItem('beginnerProgress');
    console.log('🔄 Progress reset');
  }

  // Save progress to localStorage
  private saveProgress(): void {
    try {
      const progress = this.progressSubject.value;
      localStorage.setItem('beginnerProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  }

  // Load progress from localStorage
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('beginnerProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        this.progressSubject.next(progress);
        console.log('📚 Loaded progress:', progress);
      }
    } catch (error) {
      console.error('❌ Error loading progress:', error);
    }
  }
}
