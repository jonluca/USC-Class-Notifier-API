import { create, useStore } from "zustand";
import { devtools } from "zustand/middleware";
import { createContext, useContext } from "react";

interface ClassData {
  sectionId: string;
  department: string;
  fullCourseId: string | undefined;
  semester?: string;
}
interface InvalidClass {
  isInvalid: boolean;
}
type SelectedClass = ClassData | InvalidClass;
export interface WeightAppContext {
  selectedClass: SelectedClass | null;
  setSelectedClass: (selectedClass: SelectedClass | null) => void;
}

export const context = create<WeightAppContext>()(
  devtools((set) => ({
    selectedClass: null,
    setSelectedClass: (selectedClass) => set({ selectedClass }),
  })),
);

export const AppContext = createContext<typeof context>(context);

export function useScheduleHelperContext<T>(selector: (state: WeightAppContext) => T) {
  return useStore(useContext(AppContext)!, selector);
}
