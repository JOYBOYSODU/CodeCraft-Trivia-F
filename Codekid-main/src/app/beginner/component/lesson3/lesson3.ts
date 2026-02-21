import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-level3',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lesson3.html',
  styleUrls: ['./lesson3.css']
})
export class Lesson3Component implements OnInit {
  progress = 0;
  showHintBox = false;
  isLevelCompleted = false;
  
  defaultCode = `<!DOCTYPE html>
<html>
<head>
    <title>Text Formatting Practice</title>
</head>
<body>
    <h1>My Favorite Things</h1>
    <p>I love learning HTML because it's so cool!</p>
    <p>Try making some of this text bold, italic, or underlined!</p>
</body>
</html>`;

  userCode = this.defaultCode;
  renderedOutput = '';

  ngOnInit() {
    this.updateOutput();
  }

  onCodeChange() {
    this.updateOutput();
    this.checkProgress();
  }

  updateOutput() {
    try {
      const bodyMatch = this.userCode.match(/<body[^>]*>(.*?)<\/body>/is);
      if (bodyMatch) {
        this.renderedOutput = bodyMatch[1];
      } else {
        this.renderedOutput = this.userCode;
      }
    } catch (error) {
      this.renderedOutput = '<p style="color: red;">Error in HTML code</p>';
    }
  }

  runCode() {
    this.updateOutput();
    this.checkProgress();
  }

  resetCode() {
    this.userCode = this.defaultCode;
    this.updateOutput();
    this.checkProgress();
  }

  showHint() {
    this.showHintBox = !this.showHintBox;
  }

  checkStepCompleted(step: number): boolean {
    const code = this.userCode.toLowerCase();
    
    switch (step) {
      case 1:
        return code.includes('<strong>') && code.includes('</strong>');
      case 2:
        return code.includes('<em>') && code.includes('</em>');
      case 3:
        return code.includes('<u>') && code.includes('</u>');
      case 4:
        return code.includes('<br>') || code.includes('<br/>') || code.includes('<br />');
      case 5:
        // Check for nested formatting tags
        return this.hasNestedFormattingTags(code);
      default:
        return false;
    }
  }

  hasNestedFormattingTags(code: string): boolean {
    const patterns = [
      /<strong>.*?<em>.*?<\/em>.*?<\/strong>/,
      /<em>.*?<strong>.*?<\/strong>.*?<\/em>/,
      /<strong>.*?<u>.*?<\/u>.*?<\/strong>/,
      /<u>.*?<strong>.*?<\/strong>.*?<\/u>/,
      /<em>.*?<u>.*?<\/u>.*?<\/em>/,
      /<u>.*?<em>.*?<\/em>.*?<\/u>/
    ];
    
    return patterns.some(pattern => pattern.test(code));
  }

  checkProgress() {
    const steps = [1, 2, 3, 4, 5];
    const completedSteps = steps.filter(step => this.checkStepCompleted(step));
    this.progress = Math.round((completedSteps.length / steps.length) * 100);
    
    if (completedSteps.length === steps.length) {
      setTimeout(() => {
        this.isLevelCompleted = true;
      }, 1000);
    }
  }
}
