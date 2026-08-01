/**
 * REFACTOR ENGINE
 * Provides safe, regex-based string transformation for codebase evolution.
 */
export class RefactorEngine {
    private content: string;

    constructor(initialContent: string) {
        this.content = initialContent;
    }

    rename(oldName: string, newName: string): void {
        const regex = new RegExp(oldName, 'g');
        this.content = this.content.replace(regex, newName);
    }

    getContent(): string {
        return this.content;
    }
}