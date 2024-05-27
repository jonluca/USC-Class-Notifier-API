import Dashboard from "@/components/Dashboard";
import React, { useState } from "react";
import { api } from "@/utils/api";
import { TextField, Typography } from "@mui/material";
import Cookies from "js-cookie";
import { cookieKey } from "@/server/auth";

export default () => {
  const [email, setEmail] = useState("");
  const { mutateAsync, data } = api.admin.getUserKey.useMutation();
  const utils = api.useUtils();

  if (!data) {
    return (
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
            // Ensure the length isn't over 35 characters
            if (e.target.value.length > 35) {
              return;
            }
            setEmail(e.target.value);
          }}
          onKeyDown={async (e) => {
            // Handle enter key
            if (e.key === "Enter") {
              const data = await mutateAsync({ email });
              if (!data) {
                alert("No user found");
                return;
              }
              // set document.cookie of key to users verification key and refresh all

              Cookies.set(cookieKey, data.verificationKey, {
                path: "/",
              });
              await utils.invalidate();

              return;
            }
          }}
          value={email}
        />
      </div>
    );
  }
  return <Dashboard isAdmin />;
};
