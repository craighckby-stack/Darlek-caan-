/**
 * DIAGNOSTIC ENGINE UTILITIES
 * Role: Telemetry recording, pass/fail metric summaries, and structured reporting.
 * Siphoned Pattern: AI_Agent_OS DiagnosticEngine & DiagnosticGatekeeper.
 */

class DiagnosticEngine {
    constructor(scope = 'General') {
        this.scope = scope;
        this.startTime = Date.now();
        this.events = [];
    }

    logSuccess(message, metadata = {}) {
        const event = {
            type: 'SUCCESS',
            scope: this.scope,
            message,
            metadata,
            timestamp: new Date().toISOString(),
            elapsedMs: Date.now() - this.startTime
        };
        this.events.push(event);
        return event;
    }

    logFailure(message, metadata = {}) {
        const event = {
            type: 'FAILURE',
            scope: this.scope,
            message,
            metadata,
            timestamp: new Date().toISOString(),
            elapsedMs: Date.now() - this.startTime
        };
        this.events.push(event);
        return event;
    }

    generateTelemetry() {
        const total = this.events.length;
        const failures = this.events.filter(e => e.type === 'FAILURE').length;
        const passes = total - failures;

        return {
            scope: this.scope,
            uptimeMs: Date.now() - this.startTime,
            totalEvents: total,
            passes,
            failures,
            isHealthy: failures === 0,
            passRate: total > 0 ? Number((passes / total * 100).toFixed(2)) : 100.0,
            events: this.events
        };
    }
}

module.exports = { DiagnosticEngine };