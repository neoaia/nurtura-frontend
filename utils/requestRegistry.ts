const trackedControllers = new Set<AbortController>();

export function registerTrackedController(controller: AbortController) {
  trackedControllers.add(controller);
}

export function unregisterTrackedController(controller: AbortController) {
  trackedControllers.delete(controller);
}

export function abortTrackedRequests() {
  trackedControllers.forEach((controller) => {
    try {
      controller.abort();
    } catch {
      // ignore abort failures
    }
  });

  trackedControllers.clear();
}
