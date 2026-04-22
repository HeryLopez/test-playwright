import { useCallback, useState } from "react";

const SESSION_KEY = "home-editor-canvas";

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToSession(components) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(components));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

export function useCanvas(blocksMap) {
  const [components, setComponents] = useState(loadFromSession);
  const [selectedId, setSelectedId] = useState(null);

  const setAndPersist = useCallback((updater) => {
    setComponents((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveToSession(next);
      return next;
    });
  }, []);

  const addComponentAt = useCallback(
    (type, index) => {
      const blockDef = blocksMap[type];
      if (!blockDef) return;
      const newComponent = {
        id: crypto.randomUUID(),
        type,
        props: { ...blockDef.defaults },
      };
      setAndPersist((prev) => {
        const next = [...prev];
        next.splice(index, 0, newComponent);
        return next;
      });
      setSelectedId(newComponent.id);
    },
    [blocksMap, setAndPersist],
  );

  const reorderComponent = useCallback(
    (id, targetIndex) => {
      setAndPersist((prev) => {
        const fromIndex = prev.findIndex((c) => c.id === id);
        if (fromIndex === -1) return prev;
        const next = [...prev];
        const [item] = next.splice(fromIndex, 1);
        const adjusted =
          targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
        next.splice(adjusted, 0, item);
        return next;
      });
    },
    [setAndPersist],
  );

  const updateComponent = useCallback(
    (id, newProps) => {
      setAndPersist((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c,
        ),
      );
    },
    [setAndPersist],
  );

  const selectComponent = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;

  return {
    components,
    selectedId,
    selectedComponent,
    addComponentAt,
    reorderComponent,
    updateComponent,
    selectComponent,
    deselectAll,
  };
}
