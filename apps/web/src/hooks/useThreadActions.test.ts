import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { navigateAfterThreadDeletion } from "./useThreadActions";
import { toastManager } from "../components/ui/toast";

vi.mock("../components/Localized", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../components/Localized")>();
  return {
    ...actual,
    localized: (render: Parameters<typeof actual.localized>[0]) => render(actual.englishGt),
  };
});

describe("navigateAfterThreadDeletion", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports a rejected navigation without failing the completed deletion", async () => {
    const addToast = vi.spyOn(toastManager, "add").mockReturnValue("navigation-error");

    await expect(
      navigateAfterThreadDeletion(() => Promise.reject(new Error("route unavailable"))),
    ).resolves.toBeUndefined();

    expect(addToast).toHaveBeenCalledOnce();
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Thread deleted, but navigation failed",
        description: "route unavailable",
      }),
    );
  });
});
