export interface NotifyButtonData {
  sectionId: string;
  department: string;
  fullCourseId: string | undefined;
  semester?: string;
}

export function syncNotifyButtonDataset(dataset: DOMStringMap, data: NotifyButtonData) {
  dataset.sectionId = data.sectionId;
  dataset.department = data.department;

  if (data.fullCourseId) {
    dataset.fullCourseId = data.fullCourseId;
  } else {
    delete dataset.fullCourseId;
  }

  if (data.semester) {
    dataset.semester = data.semester;
  } else {
    delete dataset.semester;
  }
}
