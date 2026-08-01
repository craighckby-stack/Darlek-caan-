/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/LifecycleManager.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

export interface SubscriptionTeardown { unsubscribe: () => void; }

export class LifecycleManager {
  private subscriptions: SubscriptionTeardown[] = [];

  public register(sub: SubscriptionTeardown): void {
    this.subscriptions.push(sub);
  }

  public destroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}






































