import { useGT } from "gt-react-native";
import { useEffect } from "react";
import { Alert } from "react-native";
import type { ConfirmDialogRequest, TextInputDialogRequest } from "./Dialog.types";

export type { ConfirmDialogRequest, TextInputDialogRequest } from "./Dialog.types";

// Native alerts open outside React, so the mounted Host keeps their default labels translated.
let defaultLabels = { cancel: "Cancel", ok: "OK" };

export function alert(...[title, message, buttons, options]: Parameters<typeof Alert.alert>): void {
  Alert.alert(title, message, buttons?.length ? buttons : [{ text: defaultLabels.ok }], options);
}

export function confirm(request: ConfirmDialogRequest): void {
  Alert.alert(request.title, request.message, [
    {
      text: request.cancelText ?? defaultLabels.cancel,
      style: "cancel",
      onPress: request.onCancel,
    },
    {
      text: request.confirmText,
      style: request.destructive ? "destructive" : "default",
      onPress: request.onConfirm,
    },
  ]);
}

export function prompt(request: TextInputDialogRequest): void {
  Alert.prompt(
    request.title,
    request.message,
    [
      {
        text: request.cancelText ?? defaultLabels.cancel,
        style: "cancel",
        onPress: request.onCancel,
      },
      { text: request.confirmText, onPress: (value) => request.onConfirm(value ?? "") },
    ],
    "plain-text",
    request.initialValue,
  );
}

export function Host() {
  const gt = useGT();
  const cancel = gt("Cancel");
  const ok = gt("OK");
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- hands the current language's labels to native alerts opened outside React
  useEffect(() => {
    defaultLabels = { cancel, ok };
  }, [cancel, ok]);
  return null;
}
