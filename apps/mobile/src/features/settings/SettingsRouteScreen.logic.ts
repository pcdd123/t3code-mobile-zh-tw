export function resolveAgentAwarenessPlatformPresentation(platform: string): {
  readonly supported: boolean;
} {
  return { supported: platform === "ios" || platform === "android" };
}
