import { validateCode } from './utils/validation';
import { languageWrappers } from './utils/languageWrappers';
import { parseExecutionError, type ExecutionError } from './utils/errorHandling';

export interface PistonExecutionResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  error?: ExecutionError;
}

export async function executeCode(language: string, code: string): Promise<PistonExecutionResult> {
  // Validate input first
  const validationError = validateCode(code);
  if (validationError) {
    throw new Error(validationError);
  }

  // Apply language-specific wrapper if available
  const wrapper = languageWrappers[language];
  const processedCode = wrapper ? wrapper(code) : code;

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        version: '*',
        files: [
          {
            content: processedCode,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute code');
    }

    const result = await response.json();

    // Process execution results
    if (result.run.code !== 0) {
      const error = parseExecutionError(result.run.stderr);
      result.error = error;
      result.run.output = error.message;
    }

    return result;
  } catch (error) {
    throw new Error(`Execution failed: ${error.message}`);
  }
}