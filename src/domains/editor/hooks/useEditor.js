import { useCallback, useState } from "react";
import { COMPONENT_DEFAULTS } from "../models/componentTypes";

export function useEditor() {
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const addComponentAt = useCallback((type, index) => {
    const newComponent = {
      id: crypto.randomUUID(),
      type,
      props: { ...COMPONENT_DEFAULTS[type] },
    };
    setComponents((prev) => {
      const next = [...prev];
      next.splice(index, 0, newComponent);
      return next;
    });
    setSelectedId(newComponent.id);
  }, []);

  const reorderComponent = useCallback((id, targetIndex) => {
    setComponents((prev) => {
      const fromIndex = prev.findIndex((c) => c.id === id);
      if (fromIndex === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      const adjusted = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      next.splice(adjusted, 0, item);
      return next;
    });
  }, []);

  const updateComponent = useCallback((id, newProps) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c,
      ),
    );
  }, []);

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
