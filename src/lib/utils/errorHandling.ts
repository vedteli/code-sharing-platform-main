export interface ExecutionError {
  type: 'timeout' | 'input' | 'validation' | 'runtime' | 'unknown';
  message: string;
}

export function parseExecutionError(stderr: string): ExecutionError {
  if (stderr.includes('Input operation timed out')) {
    return {
      type: 'timeout',
      message: 'Program timed out while waiting for input',
    };
  }
  
  if (stderr.includes('No input provided')) {
    return {
      type: 'input',
      message: 'No input was provided',
    };
  }
  
  if (stderr.includes('Invalid input')) {
    return {
      type: 'validation',
      message: stderr,
    };
  }
  
  return {
    type: 'runtime',
    message: stderr || 'Execution failed',
  };
}