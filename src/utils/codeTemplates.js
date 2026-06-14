/**
 * Default starter code templates per programming language.
 */
const CODE_TEMPLATES = {
  python: `def solution(arr):\n    \"\"\"Your solution here\"\"\"\n    pass\n\n# Test\nif __name__ == "__main__":\n    print(solution([1, 2, 3]))`,
  javascript: `function solution(arr) {\n  // Your solution here\n  return arr;\n}\n\n// Test\nconsole.log(solution([1, 2, 3]));`,
  java: `public class Solution {\n  public static void main(String[] args) {\n    // Your solution here\n  }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your solution here\n  return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n  // Your solution here\n  return 0;\n}`,
};

export function getDefaultCode(lang) {
  return CODE_TEMPLATES[lang] || `// Write your ${lang} code here\n`;
}

export function getCodeStorageKey(language) {
  return `code_${language}`;
}
