/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trigger a short vibration for haptic feedback.
 * Supported on Android/Chrome. Silent fail on iOS/Safari and unsupported browsers.
 * 
 * @param pattern - Vibration pattern (e.g., 20 for 20ms burst)
 */
export const triggerHaptic = (pattern: number | number[] = 20) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore errors if vibration fails or is blocked by policy
    }
  }
};

/**
 * Defensive check for vibration support
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.vibrate;
};
