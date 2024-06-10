import "@/styles/globals.css";
import { useStorage } from "@plasmohq/storage/hook";
import { extensionEnabledKey, showConflictsKey, showUnitsKey } from "@/constants";

function IndexPopup() {
  const [enabled, setEnabled] = useStorage(extensionEnabledKey, true);
  const [showConflicts, setShowConflicts] = useStorage(showConflictsKey, true);
  const [showUnits, setShowUnits] = useStorage(showUnitsKey, true);
  return (
    <div className={"px-4 pt-2 pb-1"}>
      <div className="border p-6 space-y-6 bg-white rounded-lg min-w-[400px]">
        <h1 className="text-2xl font-bold text-gray-800 ">USC Schedule Helper</h1>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <input
              id="enable-extension"
              className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
              type="checkbox"
              checked={enabled}
              onChange={() => setEnabled(!enabled)}
            />
            <label htmlFor="enable-extension" className="ml-2 text-sm font-medium text-gray-900">
              Enable Extension
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="show-conflicts"
              className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
              type="checkbox"
              checked={showConflicts}
              onChange={() => setShowConflicts(!showConflicts)}
              disabled={!enabled}
            />
            <label htmlFor="show-conflicts" className="ml-2 text-sm font-medium text-gray-900">
              Show Class Conflicts
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="show-units"
              className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
              type="checkbox"
              checked={showUnits}
              onChange={() => setShowUnits(!showUnits)}
              disabled={!enabled}
            />
            <label htmlFor="show-units" className="ml-2 text-sm font-medium text-gray-900">
              Show Units
            </label>
          </div>
        </div>
      </div>
      <p className="mt-2">
        <a href="https://jonlu.ca">&copy; {new Date().getFullYear()} JonLuca DeCaro </a> -{" "}
        <a href="https://github.com/jonluca/USC-Schedule-Helper">Source Code</a> -{" "}
        <a href="mailto:uscschedulehelper@jonlu.ca">Support</a>
      </p>
    </div>
  );
}

export default IndexPopup;
