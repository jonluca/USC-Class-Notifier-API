import Dashboard from "@/components/Dashboard";
import React, { useState } from "react";
import { api } from "@/utils/api";
import { TextField, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { cookieKey } from "@/server/auth";

const AddPaidIdForm = () => {
  const [paidIds, setPaidIds] = useState("");
  const { mutateAsync } = api.admin.addPaidId.useMutation();

  return (
    <div className="flex flex-col items-center gap-4 bg-gray-100 rounded-xl p-2 w-[400px] mt-4">
      <Typography variant="body2" className="font-bold text-neutral-400 text-xs ml-4 -mb-3 w-full">
        Add Paid IDs (space, tab, or comma separated)
      </Typography>
      <TextField
        className={`flex w-full bg-white rounded-xl`}
        size="small"
        variant="outlined"
        sx={{
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
          ".MuiOutlinedInput-root": { paddingY: 0.3 },
          ".MuiInputBase-input": { fontSize: 16, fontWeight: "bold" },
        }}
        placeholder={"e.g. 12345678, 87654321"}
        onChange={(e) => {
          setPaidIds(e.target.value);
        }}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            const ids = paidIds
              .split(/[\s,\t]+/)
              .map((id) => id.trim())
              .filter((id) => id.length > 0);
            if (ids.length === 0) {
              alert("No valid IDs entered");
              return;
            }
            const result = await mutateAsync({ paidIds: ids });
            if (result.updated === 0) {
              alert("No sections found with those paid IDs");
            } else {
              alert(`Marked ${result.updated} section(s) as paid`);
              setPaidIds("");
            }
          }
        }}
        value={paidIds}
      />
    </div>
  );
};

const PaidIdLookupForm = () => {
  const [paidId, setPaidId] = useState("");
  const { mutateAsync, data: lookupResult } = api.admin.getStudentByPaidId.useMutation();
  const utils = api.useUtils();

  return (
    <div className="flex flex-col items-center gap-4 bg-gray-100 rounded-xl p-2 w-[400px] mt-4">
      <Typography variant="body2" className="font-bold text-neutral-400 text-xs ml-4 -mb-3 w-full">
        Lookup User by Paid ID
      </Typography>
      <TextField
        className={`flex w-full bg-white rounded-xl`}
        size="small"
        variant="outlined"
        sx={{
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
          ".MuiOutlinedInput-root": { paddingY: 0.3 },
          ".MuiInputBase-input": { fontSize: 16, fontWeight: "bold" },
        }}
        placeholder={"e.g. 12345678"}
        onChange={(e) => {
          setPaidId(e.target.value.trim());
        }}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            if (!paidId) {
              alert("Please enter a paid ID");
              return;
            }
            const data = await mutateAsync({ paidId });
            if (!data) {
              alert("No section found with that paid ID");
              return;
            }
            Cookies.set(cookieKey, data.student.verificationKey, {
              path: "/",
            });
            await utils.invalidate();
            setPaidId("");
          }
        }}
        value={paidId}
      />
      {lookupResult && (
        <div className="w-full bg-white rounded-lg p-3 text-sm">
          <Typography variant="body2" className="font-bold text-neutral-600 mb-2">
            Student Details
          </Typography>
          <div className="space-y-1 text-neutral-700">
            <div><span className="font-semibold">Email:</span> {lookupResult.student.email}</div>
            <div><span className="font-semibold">Phone:</span> {lookupResult.student.phone || "N/A"}</div>
            <div><span className="font-semibold">USC ID:</span> {lookupResult.student.uscID || "N/A"}</div>
            <div><span className="font-semibold">Valid Account:</span> {lookupResult.student.validAccount ? "Yes" : "No"}</div>
            <div><span className="font-semibold">Created:</span> {new Date(lookupResult.student.createdAt).toLocaleDateString()}</div>
          </div>
          <Typography variant="body2" className="font-bold text-neutral-600 mt-3 mb-2">
            Section Details
          </Typography>
          <div className="space-y-1 text-neutral-700">
            <div><span className="font-semibold">Section:</span> {lookupResult.section}</div>
            <div><span className="font-semibold">Semester:</span> {lookupResult.semester}</div>
            <div><span className="font-semibold">Paid:</span> {lookupResult.isPaid ? "Yes" : "No"}</div>
            <div><span className="font-semibold">Notified:</span> {lookupResult.notified ? "Yes" : "No"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default () => {
  const [email, setEmail] = useState("");
  const { mutateAsync, data } = api.admin.getUserKey.useMutation();
  const utils = api.useUtils();

  if (!data) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 bg-gray-100 rounded-xl p-2 w-[400px] mt-4">
          <Typography variant="body2" className="font-bold text-neutral-400 text-xs ml-4 -mb-3 w-full">
            Admin Email Lookup
          </Typography>
          <TextField
            className={`flex w-full bg-white rounded-xl`}
            size="small"
            variant="outlined"
            sx={{
              ".MuiOutlinedInput-notchedOutline": { border: 0 },
              ".MuiOutlinedInput-root": { paddingY: 0.3 },
              ".MuiInputBase-input": { fontSize: 16, fontWeight: "bold" },
            }}
            placeholder={"Email"}
            onChange={(e) => {
              if (e.target.value.length > 35) {
                return;
              }
              setEmail(e.target.value);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                const data = await mutateAsync({ email });
                if (!data) {
                  alert("No user found");
                  return;
                }
                Cookies.set(cookieKey, data.verificationKey, {
                  path: "/",
                });
                await utils.invalidate();
              }
            }}
            value={email}
          />
        </div>
        <PaidIdLookupForm />
        <AddPaidIdForm />
      </>
    );
  }
  return (
    <>
      <PaidIdLookupForm />
      <AddPaidIdForm />
      <Dashboard isAdmin />
    </>
  );
};
