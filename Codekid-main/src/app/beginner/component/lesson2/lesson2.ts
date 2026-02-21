import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-level2',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lesson2.html',
  styleUrls: ['./lesson2.css']
})
export class Lesson2Component implements OnInit {

  // Properties for the component's state
  progress = 0;
  userCode = '';
  defaultCode = `<h1>My Awesome Website</h1>
<h2>About Me</h2>
<p>I am learning to code with HTML!</p>
`;
  renderedOutput: SafeHtml = '';
  showHintBox = false;
  isLevelCompleted = false;

  // An array to track the completion status of each challenge step
  private completedSteps: boolean[] = [false, false, false, false];

  // Inject DomSanitizer to safely render user-provided HTML
  constructor(private sanitizer: DomSanitizer) {}

  // Initialize the component state when it loads
  ngOnInit(): void {
    this.resetCode();
  }

  // Method called when the code in the textarea changes
  onCodeChange(): void {
    this.updateProgress();
  }

  // Renders the user's code in the output display
  runCode(): void {
    // Sanitize the user's HTML code to prevent XSS attacks before rendering
    this.renderedOutput = this.sanitizer.bypassSecurityTrustHtml(this.userCode);
    this.updateProgress();
  }

  // Resets the code editor to its default state
  resetCode(): void {
    this.userCode = this.defaultCode;
    this.runCode();
  }

  // Toggles the visibility of the hint box
  showHint(): void {
    this.showHintBox = !this.showHintBox;
  }

  // Checks if a specific challenge step is completed based on the user's code
  checkStepCompleted(step: number): boolean {
    if (!this.userCode) return false;
    const code = this.userCode.toLowerCase();

    switch (step) {
      case 1:
        // Checks for an <h1> tag with some content inside
        return /<h1>.+<\/h1>/.test(code);
      case 2:
        // Checks for an <h2> tag containing "about me"
        return /<h2>.*about me.*<\/h2>/.test(code);
      case 3:
        // Checks for a <p> tag with some content
        return /<p>.+<\/p>/.test(code);
      case 4:
        // Checks for at least two <h2> tags and two <p> tags
        const h2Matches = code.match(/<h2>/g) || [];
        const pMatches = code.match(/<p>/g) || [];
        return h2Matches.length >= 2 && pMatches.length >= 2;
      default:
        return false;
    }
  }

  // Updates the progress bar and checks if the level is complete
  private updateProgress(): void {
    // Update the status of each step
    this.completedSteps = this.completedSteps.map((_, index) => this.checkStepCompleted(index + 1));

    // Calculate the number of completed steps
    const completedCount = this.completedSteps.filter(isDone => isDone).length;

    // Update the progress bar percentage
    this.progress = (completedCount / this.completedSteps.length) * 100;

    // Check if all steps are completed
    if (completedCount === this.completedSteps.length) {
      this.isLevelCompleted = true;
    } else {
      this.isLevelCompleted = false;
    }
  }
}
