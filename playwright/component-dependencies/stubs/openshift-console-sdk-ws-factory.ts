/** No-op WebSocket factory for SDK k8s watch utilities in the gallery. */
export class WSFactory {
  constructor(_url?: string, _protocols?: string[], _options?: Record<string, unknown>) {}

  setParams(): this {
    return this;
  }

  start(): this {
    return this;
  }

  destroy(): void {
    return undefined;
  }
}
