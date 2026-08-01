class DiagnosticEngine {
  constructor(name) { this.name = name; }
  log(msg) { console.log(`[${this.name}] ${msg}`); }
  error(msg, err) { console.error(`[${this.name}] ERROR: ${msg}`, err); }
}
module.exports = { DiagnosticEngine };