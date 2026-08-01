export class MutationGatekeeper {
  validate(code: string): boolean {
    return code.includes('repoFilesContext') && code.includes('userPrompt');
  }
}