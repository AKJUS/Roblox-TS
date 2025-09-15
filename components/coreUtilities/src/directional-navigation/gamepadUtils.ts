import { detectActiveFocusTrap } from "./focusTrapUtils";
import { getCurrentOverlayedElement } from "./navigationState";
import { Direction } from "./types";

const ANALOG_STICK_DEADZONE = 0.5; // Threshold for analog stick input

// Type declarations for Chrome WebView API
declare global {
  interface Window {
    chrome?: {
      webview?: {
        postMessage(message: string): void;
      };
    };
  }
}

export function getAnalogStickDirection(gp: Gamepad): Direction | null {
  const leftStickX = gp.axes[0] ?? 0; // Left stick horizontal axis
  const leftStickY = gp.axes[1] ?? 0; // Left stick vertical axis

  // Check if stick is outside deadzone
  const magnitude = Math.sqrt(leftStickX * leftStickX + leftStickY * leftStickY);
  if (magnitude < ANALOG_STICK_DEADZONE) {
    return null;
  }

  // Determine primary direction based on which axis has greater absolute value
  if (Math.abs(leftStickX) > Math.abs(leftStickY)) {
    return leftStickX > 0 ? "right" : "left";
  }
  return leftStickY > 0 ? "down" : "up";
}

export function getDpadDirection(gp: Gamepad): Direction | null {
  const dpadUp = gp.buttons[12]?.pressed;
  const dpadDown = gp.buttons[13]?.pressed;
  const dpadLeft = gp.buttons[14]?.pressed;
  const dpadRight = gp.buttons[15]?.pressed;

  if (dpadUp) {
    return "up";
  }
  if (dpadDown) {
    return "down";
  }
  if (dpadLeft) {
    return "left";
  }
  if (dpadRight) {
    return "right";
  }

  return null;
}

export function isActionPressed(gp: Gamepad, previousGp: Gamepad | undefined): boolean {
  const isActionPressed = gp.buttons[0]?.pressed ?? false;
  const wasActionPressed = previousGp?.buttons[0]?.pressed ?? false;

  return isActionPressed && !wasActionPressed;
}

export function isCancelPressed(gp: Gamepad, previousGp: Gamepad | undefined): boolean {
  const isCancelPressed = gp.buttons[1]?.pressed ?? false;
  const wasCancelPressed = previousGp?.buttons[1]?.pressed ?? false;

  return isCancelPressed && !wasCancelPressed;
}

export function simulateEscapeKeyEvent(
  type: "keydown" | "keyup",
  target: Element | Document,
): void {
  const event = new KeyboardEvent(type, {
    key: "Escape",
    code: "Escape",
    keyCode: 27,
    which: 27,
    bubbles: true,
    cancelable: true,
  });

  target.dispatchEvent(event);
}

function informParentOfCancelEvent(): void {
  if (window.chrome?.webview) {
    window.chrome.webview.postMessage(
      JSON.stringify({ type: "navigation", action: "navigateBack" }),
    );
  }
}

// Simulates an escape keypress, either from:
// 1. The overlayed element.
// 2. The active focus trap.
// 3. The document body.
// Then, decide if we should inform the parent that "Cancel" was pressed.
export function handleCancelPressed() {
  const overlayedElement = getCurrentOverlayedElement();
  let keydownHandled = true;
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      keydownHandled = false;
    }
  };
  const focusTrap = detectActiveFocusTrap();
  const targetForEscape = overlayedElement ?? focusTrap ?? document.body;
  document.addEventListener("keydown", keydownHandler);
  simulateEscapeKeyEvent("keydown", targetForEscape);
  simulateEscapeKeyEvent("keyup", targetForEscape);
  document.removeEventListener("keydown", keydownHandler);

  setTimeout(() => {
    // If the escape key was not handled by the target and we are not in a focus trap, inform the parent.
    if (!keydownHandled && !focusTrap) {
      informParentOfCancelEvent();
    }
  }, 50);
}
