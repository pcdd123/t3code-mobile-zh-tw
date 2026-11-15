import type { useGT } from "gt-react";

import { PREVIEW_ERROR_CODE_MESSAGES } from "./previewConstants";

type Translate = ReturnType<typeof useGT>;

function translatePreviewErrorMessage(message: string, gt: Translate): string {
  switch (message) {
    case "DNS address could not be found":
      return gt("DNS address could not be found");
    case "Connection refused":
      return gt("Connection refused");
    case "Connection was reset":
      return gt("Connection was reset");
    case "Connection was closed":
      return gt("Connection was closed");
    case "Connection timed out":
      return gt("Connection timed out");
    case "No internet connection":
      return gt("No internet connection");
    case "Certificate authority is not trusted":
      return gt("Certificate authority is not trusted");
    case "Certificate hostname mismatch":
      return gt("Certificate hostname mismatch");
    case "Certificate is expired or not yet valid":
      return gt("Certificate is expired or not yet valid");
    case "Too many redirects":
      return gt("Too many redirects");
    default:
      return message;
  }
}

export function describePreviewError(description: string, gt: Translate): string {
  const friendly = PREVIEW_ERROR_CODE_MESSAGES[description];
  if (friendly) return translatePreviewErrorMessage(friendly, gt);
  if (description.length > 0) return description;
  return gt("Network error");
}
