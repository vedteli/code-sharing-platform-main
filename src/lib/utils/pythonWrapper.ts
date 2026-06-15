export function createPythonWrapper(code: string): string {
  const indentedCode = code
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return `import signal
import sys

def timeout_handler(signum, frame):
    print("Error: Input operation timed out")
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(5)  # 5 second timeout

try:
${indentedCode}
except ValueError as e:
    print(f"Error: Invalid input - {str(e)}")
except Exception as e:
    print(f"Error: {str(e)}")
finally:
    signal.alarm(0)`;
}