class DiagnosticEngine {
    constructor(context) { this.context = context; }
    logSuccess(msg) { console.log(`[${this.context}][SUCCESS] ${msg}`); }
    logFailure(msg) { console.error(`[${this.context}][FAILURE] ${msg}`); }
}
module.exports = { DiagnosticEngine };