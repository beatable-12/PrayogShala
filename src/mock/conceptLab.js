export const PALINDROME_STARTER_CODE = `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Initialize your pointers here
        left, right = 0, len(s) - 1
        
        while left < right:
            # Write logic to skip non-alphanumeric
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
                
            if s[left].lower() != s[right].lower():
                return False
                
            left += 1
            right -= 1
            
        return True`;

export const SARVAM_GREETINGS = {
  English:
    'Hello! Two Pointers means using two variables to track indices. For palindromes:\n1. Place L at index 0.\n2. Place R at the end.\n3. Compare characters while L < R.',
  'Hindi (हिन्दी)':
    'नमस्ते! Two Pointers का मतलब है इंडेक्स को ट्रैक करने के लिए दो वेरिएबल्स का उपयोग करना। Palindromes के लिए:\n1. L को इंडेक्स 0 पर रखें।\n2. R को अंत में रखें।\n3. L < R होने तक कैरेक्टर की तुलना करें।',
  'Tamil (தமிழ்)':
    'வணக்கம்! Two Pointers என்பது குறியீடுகளைக் கண்காணிக்க இரண்டு மாறிகளைப் பயன்படுத்துவதாகும். Palindromes க்கு:\n1. L ஐ குறியீடு 0 இல் வைக்கவும்.\n2. R ஐ இறுதியில் வைக்கவும்.\n3. L < R ஆக இருக்கும்போது எழுத்துக்களை ஒப்பிடவும்.',
  'Telugu (తెలుగు)':
    'నమస్తే! Two Pointers అంటే సూచీలను ట్రాక్ చేయడానికి రెండు వేరియబుల్స్ ఉపయోగించడం. Palindromes కోసం:\n1. L ని ఇండెక్స్ 0 వద్ద ఉంచండి.\n2. R ని చివర ఉంచండి.\n3. L < R ఉన్నప్పుడు అక్షరాలను పోల్చండి.',
  'Kannada (ಕನ್ನಡ)':
    'ನಮಸ್ತೆ! Two Pointers ಎಂದರೆ ಸೂಚ್ಯಂಕಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಎರಡು ವೇರಿಯಬಲ್ ಬಳಸುವುದು. Palindromes ಗಾಗಿ:\n1. L ಅನ್ನು ಸೂಚ್ಯಂಕ 0 ನಲ್ಲಿ ಇರಿಸಿ.\n2. R ಅನ್ನು ಕೊನೆಯಲ್ಲಿ ಇರಿಸಿ.\n3. L < R ಇರುವಾಗ ಅಕ್ಷರಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.',
};

export function createInitialConceptLabChat() {
  return [
    {
      sender: 'user',
      text: 'Can you explain the "Two Pointers" logic for this palindrome problem?',
    },
    { sender: 'sarvam', text: SARVAM_GREETINGS.English },
  ];
}
