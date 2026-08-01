/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC ENGINE: UPDATE PROPOSE
 * Role: Validates kernel integrity for the evolution proposal route.
 * Integration: Connects to diagnostic_context.ts and mutation_gatekeeper.ts for real-time system health monitoring.
 * Dependencies: fs, diagnostic_context, mutation_gatekeeper
 */

const fs = require('fs');
const { DiagnosticContext } = require('./src/lib/diagnostic-context');
const { MutationGatekeeper } = require('./src/lib/mutation-gatekeeper');

const file = 'src/app/api/evolution/propose/route.ts';
const ctx = new DiagnosticContext();
const gatekeeper = new MutationGatekeeper();

function executeMutation() {
  try {
    ctx.start('mutation_execution');
    let code = fs.readFileSync(file, 'utf8');

    const userPromptRegex = /(const userPrompt = `Analyze this file and propose improvements:\\n\${rejectionContext\\}\\n\${appliedMutationsContext\\}\\n\${userReposContextStr\\}\nACTUAL SIPHONED CODE PATTERNS)/;

    code = code.replace(
      userPromptRegex,
      `const repoFilesContext = Array.isArray((body as any)?.repoFiles) \n      ? \`\\nEXISTING REPOSITORY FILES:\\n\${(body as any).repoFiles.slice(0, 1000).join('\\n')}\\n\` \n      : '';\n    $1`
    );

    code = code.replace(
      /(const userPrompt = `Analyze this file and propose improvements:\\n\${rejectionContext\\}\\n\${appliedMutationsContext\\}\\n\${userReposContextStr\\})/,
      `$1\n\${repoFilesContext}`
    );

    // Validate integrity before write
    if (gatekeeper.validate(code)) {
      fs.writeFileSync(file, code);
      ctx.logSuccess('mutation_execution');
    } else {
      throw new Error('Mutation failed gatekeeper validation');
    }
  } catch (error) {
    ctx.logError('mutation_execution', error);
    throw error;
  }
}

executeMutation();