export function createCppWrapper(code: string): string {
  const indentedCode = code
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return `#include <iostream>
#include <limits>
#include <stdexcept>

int main() {
    try {
${indentedCode}
    } catch (const std::invalid_argument& e) {
        std::cerr << "Error: Invalid input - " << e.what() << std::endl;
        return 1;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
`;
}