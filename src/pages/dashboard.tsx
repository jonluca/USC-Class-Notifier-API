import { api } from "~/utils/api";
import { LinearProgress, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import type { RouterOutputs } from "~/server/api";
import type { AgGridReactProps } from "@ag-grid-community/react";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { getSemester } from "~/utils/semester";
import { SettingEntry } from "~/components/SettingsEntry";
import { toast } from "react-toastify";
import PencilIcon from "@mui/icons-material/Edit";
import Close from "@mui/icons-material/Close";
import Save from "@mui/icons-material/Save";
import LinkIcon from "@mui/icons-material/Link";
import Link from "next/link";
ModuleRegistry.registerModules([ClientSideRowModelModule]);
type Section = RouterOutputs["user"]["getWatchedClasses"][number];
type ColDef = AgGridReactProps<Section>["columnDefs"];
const defaultColDef: NonNullable<ColDef>[number] = {
  width: 130,
  sortable: true,
  filter: true,
};

const NotifyButton = ({ data }: { data: Section }) => {
  if (!data || !data.notified) {
    return null;
  }
  // check if it's in the past
  const semester = data.semester;
  if (semester) {
    const year = semester.slice(0, 4);
    const currentYear = new Date().getFullYear();
    // we could be smarter and do per semester but this is fine
    if (parseInt(year) < currentYear) {
      return null;
    }
  }
  const utils = api.useUtils();

  const { mutateAsync, isPending } = api.user.continueReceivingNotificationsForSection.useMutation();
  const submit = async () => {
    await toast.promise(mutateAsync({ id: data.id }), {
      pending: "Re-notifying",
      success: "Re-notified",
      error: "Failed to re-notify",
    });
    await utils.user.invalidate();
  };

  return (
    <button
      className="inline-flex py-1 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 disabled:pointer-events-none disabled:opacity-50"
      disabled={isPending}
      onClick={submit}
    >
      Re-Notify
    </button>
  );
};
const iconStyle = { fontSize: 14, cursor: "pointer" };

const PhoneOverride = ({ data }: { data: Section }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [phone, setPhone] = useState(data.phoneOverride || "");
  const { mutateAsync } = api.user.changePhoneNumberForSection.useMutation();
  const utils = api.useUtils();

  if (isEdit) {
    return (
      <span className={"flex items-center gap-2"}>
        <Close sx={iconStyle} onClick={() => setIsEdit(false)} />
        <Save
          sx={iconStyle}
          onClick={async () => {
            if (phone.length !== 10) {
              toast.error("Phone number must be 10 digits");
              return;
            }
            await toast.promise(mutateAsync({ id: data.id, phoneNumber: phone }), {
              pending: "Saving",
              success: "Saved",
              error: "Failed to save",
            });
            await utils.user.invalidate();
            setIsEdit(false);
          }}
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
      </span>
    );
  }
  return (
    <span className={"flex h-full gap-2 items-center"}>
      {data.phoneOverride || ""}
      <PencilIcon sx={iconStyle} onClick={() => setIsEdit(true)} />
    </span>
  );
};

const VenmoLink = ({ data }: { data: Section }) => {
  return (
    <Link href={`https://account.venmo.com/pay?recipients=JonLuca&amount=1&note=${data.paidId}`} target={"_blank"}>
      <span className={"flex h-full gap-2 items-center"}>
        {data.paidId || ""}
        <LinkIcon sx={iconStyle} />
      </span>
    </Link>
  );
};

const columns = [
  // { headerName: "Department", field: "ClassInfo.department" },
  { headerName: "Section", field: "section", width: 100 },
  { headerName: "Course", field: "ClassInfo.courseNumber", width: 120 },
  { headerName: "Semester", field: "semester", initialSort: "desc", width: 137 },
  { headerName: "Notified", field: "notified", width: 90, filter: false },
  { headerName: "Venmo ID", field: "paidId", width: 113, cellRenderer: VenmoLink },
  { headerName: "Phone", field: "phoneOverride", cellRenderer: PhoneOverride, width: 160 },
  { headerName: "Paid", field: "isPaid", width: 80, filter: false },
  { headerName: "Notify", field: "notified", cellRenderer: NotifyButton },
] as ColDef;

const EditPhoneGlobal = () => {
  const { data: userInfo } = api.user.getUserInfo.useQuery();

  const [isEdit, setIsEdit] = useState(false);
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const { mutateAsync } = api.user.changePhoneNumberForAccount.useMutation();
  const utils = api.useUtils();

  if (isEdit) {
    return (
      <span className={"flex items-center gap-2"}>
        <Close sx={iconStyle} onClick={() => setIsEdit(false)} />
        <Save
          sx={iconStyle}
          onClick={async () => {
            if (phone.length !== 10) {
              toast.error("Phone number must be 10 digits");
              return;
            }
            await toast.promise(mutateAsync({ phoneNumber: phone }), {
              pending: "Saving",
              success: "Saved",
              error: "Failed to save",
            });
            await utils.user.invalidate();
            setIsEdit(false);
          }}
        />
        <input
          type="text"
          value={phone}
          className="w-full h-12 px-4 text-sm text-gray-900 placeholder-gray-500 bg-gray-100 border-2 border-gray-100 rounded-lg"
          onChange={(e) => {
            setPhone(e.target.value);
          }}
        />
      </span>
    );
  }

  if (!userInfo) {
    return null;
  }
  return (
    <span className={"flex h-full gap-2 items-center"}>
      {userInfo.phone || ""}
      <PencilIcon sx={iconStyle} onClick={() => setIsEdit(true)} />
    </span>
  );
};
export default function Dashboard() {
  const { data, isLoading } = api.user.getWatchedClasses.useQuery();
  const { data: userInfo } = api.user.getUserInfo.useQuery();
  const [showOldSemesters, setShowOldSemesters] = useState(false);
  const { mutateAsync, isPending } = api.user.setAccountLevelPhoneToAllSections.useMutation();
  const utils = api.useUtils();

  const setAccountLevelPhoneToAllSections = async () => {
    await toast.promise(mutateAsync(), {
      pending: "Setting phone number",
      success: "Set phone number",
      error: "Failed to set phone number",
    });
    await utils.user.invalidate();
  };
  const filteredData = useMemo(() => {
    if (showOldSemesters) {
      return data || [];
    }
    return data?.filter((section) => section.semester === getSemester()) || [];
  }, [data, showOldSemesters]);
  return (
    <div className={"flex flex-col h-full py-4 gap-4"}>
      {isLoading && <LinearProgress />}
      {userInfo && <h1>Welcome, {userInfo.email}</h1>}
      {userInfo && (
        <div className={"flex items-center gap-2"}>
          <div className={"flex items-center gap-2"}>
            Phone: <EditPhoneGlobal />
          </div>
          {userInfo.phone && (
            <button
              className="inline-flex py-1 items-center justify-center rounded-md bg-gray-900 px-3 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 disabled:pointer-events-none disabled:opacity-50"
              disabled={isPending}
              onClick={setAccountLevelPhoneToAllSections}
            >
              Use for all classes
            </button>
          )}
        </div>
      )}
      <div className={"flex"}>
        <SettingEntry
          checked={showOldSemesters}
          onChange={() => setShowOldSemesters(!showOldSemesters)}
          title="Show Old Semesters"
          subtitle="Show classes from previous semesters"
        />
      </div>

      {/* Grid goes here */}
      {!isLoading && (
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
          <AgGridReact<Section> rowData={filteredData} columnDefs={columns} defaultColDef={defaultColDef} />
        </div>
      )}
      <div className="flex flex-col items-start gap-2 bg-gray-100 p-3 md:p-2 rounded-lg shadow-inner w-full max-w-2xl">
        {/* Beta tag with violet background */}
        <div className="flex flex-col items-start md:flex-row md:items-center gap-2 w-full">
          <Typography variant="body2" className="bg-orange-300 text-white px-2 rounded-md font-bold text-[12px]">
            {"Note"}
          </Typography>
          <Typography variant="body2" className="text-neutral-400 font-bold text-[12px] mx-auto">
            If you want to enable text notifications for a class, make sure the phone number for that section is correct
            and then click the venmo ID number, or venmo the exact 8 digits in that column to @JonLuca
          </Typography>
        </div>
      </div>
    </div>
  );
}
