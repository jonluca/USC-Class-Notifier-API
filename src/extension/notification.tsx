import { useScheduleHelperContext } from "@/extension/context";
import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { CircularProgress, TextField, Typography } from "@mui/material";
import { trpc } from "@/extension/data";
import { toast } from "react-toastify";
import venmoBase64 from "data-base64:-/venmo.png";
import venmoBase64Qr from "data-base64:-/venmo-qr.jpeg";
import * as EmailValidator from "email-validator";

const localStorageEmailKey = "uscScheduleHelperEmail";
const localStoragePhoneKey = "uscScheduleHelperPhone";
const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => {
  return (
    <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-xl p-1 w-full">
      <Typography variant="body2" className="font-bold text-neutral-400 text-xs ml-4 -mb-3 w-full">
        {label}
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
        placeholder={label}
        onChange={(e) => {
          // Ensure the length isn't over 35 characters
          if (e.target.value.length > 35) {
            return;
          }
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          // Handle enter key
          if (e.key === "Enter") {
            return;
          }
        }}
        value={value}
      />
    </div>
  );
};

const CollectInfo = ({ onClose }: { onClose: () => void }) => {
  const selectedClass = useScheduleHelperContext((state) => state.selectedClass)!;
  console.log(selectedClass);

  const { mutateAsync, isPending, data, error } = trpc.user.addWatchedClass.useMutation();
  const { mutateAsync: sendLoginEmail, isPending: isPendingLogin, isSuccess } = trpc.user.sendLoginEmail.useMutation();
  const [email, setEmail] = useState(localStorage.getItem(localStorageEmailKey) || "");
  const [phone, setPhone] = useState(localStorage.getItem(localStoragePhoneKey) || "");
  if ("isInvalid" in selectedClass) {
    toast.error("Invalid class");
    return null;
  }
  const isValidEmail = EmailValidator.validate(email);
  const onSubmit = async () => {
    await mutateAsync({
      sectionNumber: selectedClass.sectionId,
      email,
      department: selectedClass.department,
      phone: phone || undefined,
    });
  };

  const renderContent = () => {
    if (data) {
      const venmoUrl = `https://account.venmo.com/pay?recipients=JonLuca&amount=1&note=${data.paidId}`;
      return (
        <div className="flex flex-col items-center gap-2 w-full">
          <span className={"font-bold"}>Success!</span>
          {!data.isVerifiedAccount && (
            <span className={""}>
              You will receive an email shortly to verify your account. Please check your spam folder if you do not see
              it. You will only receive notifications once you verify your account.
            </span>
          )}
          {data.alreadyWatching ? (
            <span className={""}>You are already watching this class</span>
          ) : (
            <span className={""}>You are now watching this class</span>
          )}
          <span className={""}>Email notifications will go to {data.email}</span>
          {data.isPaid ? (
            <span className={""}>
              You have already paid for notifications for section {selectedClass.sectionId} - no need to do anything
              else!
            </span>
          ) : data.showVenmoInfo ? (
            <>
              <span className={""}>
                If you would like to receive text notifications, you can venmo $1 to{" "}
                <a
                  href={venmoUrl}
                  target={"_blank"}
                  id="venmo-image"
                  style={{ position: "relative" }}
                  className={"my-2 underline"}
                >
                  @JonLuca
                </a>{" "}
                with just the code {data.paidId}, like below:
              </span>
              <a href={venmoUrl} target={"_blank"} id="venmo-image" style={{ position: "relative" }} className={"my-2"}>
                <img src={venmoBase64 as unknown as string} alt="Venmo QR Code" />

                <span
                  className={"font-bold"}
                  style={{
                    position: "absolute",
                    left: "13%",
                    top: "31%",
                  }}
                >
                  {data.paidId}
                </span>
              </a>
              <img src={venmoBase64Qr as unknown as string} alt="Venmo QR Code" style={{ maxHeight: 250 }} />
              <span className={"font-bold"}>If it asks for a last 4 digits of the phone number, use 9020</span>
            </>
          ) : null}
        </div>
      );
    }
    return (
      <>
        <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-xl p-1 w-full">
          <Input label="Email" value={email} onChange={setEmail} />
          <Input label="Phone (optional, $1 per section per semester)" value={phone} onChange={setPhone} />
        </div>
      </>
    );
  };
  return (
    <>
      <div className="flex flex-col items-center gap-1 w-full">
        <span>
          Notifications for{" "}
          {selectedClass.fullCourseId && <span className="font-bold">{selectedClass.fullCourseId} - </span>}
          <span className={"font-bold"}>{`Section ${selectedClass.sectionId}`}</span>
        </span>
      </div>
      {renderContent()}
      {error && (
        <div className="flex flex-col gap-2 w-full">
          <span className={"text-red-400 font-bold"}>There was an error processing your class:</span>
          <span className={"text-red-400"}>{error.message}</span>
          <span className={"text-red-400"}>Please reach out to jdecaro@usc.edu with a screenshot of the above</span>
        </div>
      )}
      <div className="flex gap-2 items-center w-full">
        {(isPending || isPendingLogin) && (
          <CircularProgress
            sx={{
              borderRadius: 2,
              height: 8,
              width: "50%",
              "& .MuiLinearProgress-bar": {
                bgcolor: "black",
                borderRadius: 10,
              },
            }}
          />
        )}

        <div className="flex gap-2 ml-auto">
          {isValidEmail && (
            <button
              disabled={isPendingLogin}
              className="flex items-center gap-1 px-2 py-1 text-sm font-bold text-neutral-400 hover-scale"
              onClick={() => {
                sendLoginEmail({ email });
              }}
            >
              {isSuccess ? "Check your email for the login link" : "View Dashboard"}
            </button>
          )}
          <button
            disabled={isPending || !isValidEmail}
            className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1 text-sm font-bold hover-scale"
            onClick={() => {
              if (data || error) {
                onClose();
              } else {
                onSubmit();
              }
            }}
          >
            {data || error ? "Close" : isValidEmail ? "Submit" : "Please enter a valid email"}
          </button>
        </div>
      </div>
    </>
  );
};
const NotificationModal = () => {
  const selectedClass = useScheduleHelperContext((state) => state.selectedClass)!;
  const setSelectedClass = useScheduleHelperContext((state) => state.setSelectedClass);

  const onClose = () => {
    setSelectedClass(null);
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      style={{
        outline: 0,
      }}
      disablePortal={true}
    >
      <>
        <div
          className={`flex outline-none flex-col items-center gap-4 w-full md:w-[500px] min-h-[200px] absolute bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 px-6 py-6 rounded-t-3xl md:rounded-2xl shadow-lg bg-white max-h-screen overflow-y-auto pb-8 md:pb-4`}
        >
          {selectedClass ? (
            "isInvalid" in selectedClass ? (
              <div>Invalid class or section</div>
            ) : (
              <CollectInfo onClose={onClose} />
            )
          ) : null}
        </div>
      </>
    </Modal>
  );
};
export default NotificationModal;
