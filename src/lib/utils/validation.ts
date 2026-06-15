export function validateCode(code: string): string | null {
  if (!code.trim()) {
    return 'Code cannot be empty';
  }

  // Check for potential infinite loops
  if (code.includes('while True') || code.includes('for(;;)') || code.includes('while(1)')) {
    return 'Infinite loops are not allowed';
  }

  // Check for system calls that might be harmful
  const dangerousPatterns = [
    'system(',
    'exec(',
    'spawn(',
    'fork(',
    'eval(',
    'subprocess',
    'os.system',
  ];

  for (const pattern of dangerousPatterns) {
    if (code.includes(pattern)) {
      return 'System calls are not allowed for security reasons';
    }
  }

  return null;
}