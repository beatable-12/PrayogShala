/**
 * src/utils/submissionValidation.ts
 * Validation utilities for submission data
 * Ensures code, language, and context are valid before submission
 */

import { ProgrammingLanguage, SubmitCodePayload } from '../types';

/**
 * Supported programming languages
 */
const SUPPORTED_LANGUAGES: ProgrammingLanguage[] = [
  'python',
  'javascript',
  'java',
  'cpp',
  'c',
];

/**
 * Validation rules
 */
export const SUBMISSION_VALIDATION_RULES = {
  code: {
    minLength: 1,
    maxLength: 50000, // 50KB
    required: true,
  },
  language: {
    required: true,
    allowedValues: SUPPORTED_LANGUAGES,
  },
  topicId: {
    required: true,
    minLength: 1,
  },
  projectId: {
    required: false,
    minLength: 1,
  },
};

/**
 * Validate code submission payload
 * Returns array of validation errors (empty if valid)
 */
export function validateSubmission(payload: Partial<SubmitCodePayload>): string[] {
  const errors: string[] = [];

  // Validate code
  if (!payload.code) {
    errors.push('Code is required');
  } else if (payload.code.trim().length === 0) {
    errors.push('Code cannot be empty or only whitespace');
  } else if (payload.code.length < SUBMISSION_VALIDATION_RULES.code.minLength) {
    errors.push(
      `Code must be at least ${SUBMISSION_VALIDATION_RULES.code.minLength} character`
    );
  } else if (payload.code.length > SUBMISSION_VALIDATION_RULES.code.maxLength) {
    errors.push(
      `Code exceeds maximum length of ${SUBMISSION_VALIDATION_RULES.code.maxLength} characters`
    );
  }

  // Validate language
  if (!payload.language) {
    errors.push('Programming language is required');
  } else if (!SUPPORTED_LANGUAGES.includes(payload.language)) {
    errors.push(
      `Unsupported language "${payload.language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}`
    );
  }

  // Validate topicId
  if (!payload.topicId) {
    errors.push('Topic context is required');
  } else if (payload.topicId.trim().length === 0) {
    errors.push('Topic ID cannot be empty');
  }

  return errors;
}

/**
 * Validate code syntax (basic checks)
 * Not a full parser - just common errors
 */
export function validateCodeSyntax(code: string, language: ProgrammingLanguage): string[] {
  const warnings: string[] = [];

  switch (language) {
    case 'python':
      // Check for common Python issues
      if (code.includes('\t') && code.includes('    ')) {
        warnings.push('Mixed tabs and spaces detected (Python is sensitive to indentation)');
      }
      if (!code.includes('def ') && !code.includes('class ')) {
        warnings.push('No function or class definition found');
      }
      break;

    case 'javascript':
      // Check for common JS issues
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        warnings.push('Mismatched braces detected');
      }
      break;

    case 'java':
      if (!code.includes('public class')) {
        warnings.push('Java code should define a public class');
      }
      if (!code.includes('public static void main')) {
        warnings.push('No main method found');
      }
      break;

    case 'cpp':
    case 'c':
      if (!code.includes('#include')) {
        warnings.push('No #include directives found');
      }
      if (!code.includes('int main')) {
        warnings.push('No main function found');
      }
      break;
  }

  return warnings;
}

/**
 * Check if code has changed since last submission
 */
export function hasCodeChanged(currentCode: string, lastSubmittedCode?: string): boolean {
  if (!lastSubmittedCode) return true;
  return currentCode.trim() !== lastSubmittedCode.trim();
}

/**
 * Estimate code complexity (very basic)
 * Returns: 'simple', 'moderate', 'complex'
 */
export function estimateCodeComplexity(code: string): 'simple' | 'moderate' | 'complex' {
  const lines = code.split('\n').length;
  const hasNesting = /(\{.*\{|\(.*\()/g.test(code);
  const hasRecursion = /\b\w+\s*\(.*\b\w+\s*\(/g.test(code);

  if (lines < 20 && !hasNesting) return 'simple';
  if (lines < 100 && !hasRecursion) return 'moderate';
  return 'complex';
}

/**
 * Get language-specific file extension
 */
export function getLanguageExtension(language: ProgrammingLanguage): string {
  const extensions: Record<ProgrammingLanguage, string> = {
    python: '.py',
    javascript: '.js',
    java: '.java',
    cpp: '.cpp',
    c: '.c',
  };
  return extensions[language];
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: ProgrammingLanguage): string {
  const names: Record<ProgrammingLanguage, string> = {
    python: 'Python 3',
    javascript: 'JavaScript (Node.js)',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
  };
  return names[language];
}

/**
 * Validate submission before showing result
 * Ensures all required fields are present
 */
export function validateSubmissionResult(submission: any): string[] {
  const errors: string[] = [];

  if (!submission._id) errors.push('Invalid submission ID');
  if (!submission.status) errors.push('Submission status missing');
  if (submission.code === undefined) errors.push('Code missing from submission');
  if (!submission.language) errors.push('Language missing from submission');
  if (!submission.createdAt) errors.push('Timestamp missing');

  return errors;
}

/**
 * Estimate time to execute code
 * Used for UX feedback during polling
 */
export function estimateExecutionTime(language: ProgrammingLanguage): number {
  const estimates: Record<ProgrammingLanguage, number> = {
    python: 2000, // 2 seconds
    javascript: 1500, // 1.5 seconds
    java: 3000, // 3 seconds
    cpp: 1000, // 1 second
    c: 1000, // 1 second
  };
  return estimates[language];
}
