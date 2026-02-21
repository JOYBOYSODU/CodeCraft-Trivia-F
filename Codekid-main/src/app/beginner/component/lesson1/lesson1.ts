import { Component, OnInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProgressService } from '../../../services/progress.service';

@Component({
  selector: 'app-level1',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lesson1.html',
  styleUrls: ['./lesson1.css']
})
export class Lesson1Component implements OnInit {

  // --- Component State ---
  progress = 0;
  userCode = '';
  renderedOutput: SafeHtml = '';
  showHintBox = false;
  isLevelCompleted = false;

  // --- Challenge Tracking ---
  private challengeSteps = {
    1: false, // Basic HTML structure
    2: false, // Title added
    3: false  // h1 with name added
  };

  private readonly defaultCode = `<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>
  <h1></h1>
</body>
</html>`;

  constructor(
    private sanitizer: DomSanitizer,
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetCode();
  }

  // --- User Actions ---

  /** Runs the user's code, sanitizes it, and checks for challenge completion. */
  runCode(): void {
    // Sanitize the user's HTML to prevent security vulnerabilities
    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, this.userCode);
    this.renderedOutput = this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml || '');
    this.checkAllSteps();
  }

  /** Resets the code editor and all progress. */
  resetCode(): void {
    this.userCode = this.defaultCode;
    this.renderedOutput = '';
    this.isLevelCompleted = false;
    this.showHintBox = false;
    Object.keys(this.challengeSteps).forEach(key => {
        const step = key as unknown as keyof typeof this.challengeSteps;
        this.challengeSteps[step] = false;
    });
    this.updateProgress();
  }

  /** Toggles the visibility of the hint box. */
  showHint(): void {
    this.showHintBox = !this.showHintBox;
  }
  
  /** Updates the progress bar and checks for level completion on every code change. */
  onCodeChange(): void {
      this.checkAllSteps();
  }

  // --- Challenge Logic ---

  /** Checks if a specific challenge step is completed. */
  checkStepCompleted(step: number): boolean {
    const key = step as keyof typeof this.challengeSteps;
    return this.challengeSteps[key];
  }

  /** Evaluates all challenge steps against the user's code. */
  private checkAllSteps(): void {
    const code = this.userCode.toLowerCase().trim();

    // Step 1: Check for basic HTML structure
    this.challengeSteps[1] = 
      code.includes('<!doctype html>') &&
      code.includes('<html>') && code.includes('</html>') &&
      code.includes('<head>') && code.includes('</head>') &&
      code.includes('<body>') && code.includes('</body>');
      
    // Step 2: Check for a title with content
    const titleRegex = /<title>(.+)<\/title>/;
    this.challengeSteps[2] = titleRegex.test(code) && (code.match(titleRegex)?.[1]?.trim() ?? '').length > 0;

    // Step 3: Check for an h1 tag with content
    const h1Regex = /<h1>(.+)<\/h1>/;
    this.challengeSteps[3] = h1Regex.test(code) && (code.match(h1Regex)?.[1]?.trim() ?? '').length > 0;

    this.updateProgress();
    this.checkLevelCompletion();
  }
  
  /** Updates the progress bar based on completed steps. */
  private updateProgress(): void {
    const completedCount = Object.values(this.challengeSteps).filter(Boolean).length;
    const totalSteps = Object.keys(this.challengeSteps).length;
    this.progress = (completedCount / totalSteps) * 100;
  }

  /** Checks if all steps are completed to mark the level as finished. */
  private checkLevelCompletion(): void {
    const wasCompleted = this.isLevelCompleted;
    this.isLevelCompleted = Object.values(this.challengeSteps).every(Boolean);
    
    // If lesson just completed, mark it in progress service
    if (this.isLevelCompleted && !wasCompleted) {
      console.log('🎉 Lesson 1 completed!');
      this.progressService.completeLesson(1);
      
      // Show completion message and navigation options
      setTimeout(() => {
        const result = confirm(
          '🎉 Congratulations! You completed Lesson 1!\n\n' +
          '🔓 Lesson 2 is now unlocked!\n\n' +
          'Would you like to go to Lesson 2 now?'
        );
        
        if (result) {
          this.router.navigate(['/beginner/lesson2']);
        } else {
          this.router.navigate(['/beginner']);
        }
      }, 1000);
    }
  }
}
