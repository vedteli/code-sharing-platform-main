export function createJavaWrapper(code: string): string {
  const indentedCode = code
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return `import java.util.Scanner;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Scanner scanner = new Scanner(System.in);
        
        try {
${indentedCode}
        } catch (NumberFormatException e) {
            System.err.println("Error: Invalid number format - " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        } finally {
            scanner.close();
            executor.shutdownNow();
        }
    }
}
`;
}