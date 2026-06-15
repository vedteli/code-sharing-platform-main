import { createPythonWrapper } from './pythonWrapper';
import { createJavaWrapper } from './javaWrapper';
import { createCppWrapper } from './cppWrapper';

export const languageWrappers: Record<string, (code: string) => string> = {
  python: createPythonWrapper,
  java: createJavaWrapper,
  'c++': createCppWrapper,
};