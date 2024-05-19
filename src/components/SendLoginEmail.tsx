import { api } from "~/utils/api";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export const SendLoginEmail = () => {
  const { mutateAsync, isPending } = api.user.sendLoginEmail.useMutation();
  const { data: hasUser } = api.user.hasUser.useQuery();
  const [email, setEmail] = useState("");
  const router = useRouter();
  const submit = async () => {
    if (isPending) {
      return;
    }
    await toast.promise(mutateAsync({ email }), {
      pending: "Sending email...",
      success: "Email sent",
      error: "Error sending email",
    });
  };

  if (hasUser) {
    return (
      <div className={"flex flex-col gap-4 w-fit py-4"}>
        <p className={"text-gray-500 md:text-xl"}>You are already logged in</p>
        <button
          onClick={() => {
            router.push("/dashboard");
          }}
          className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 disabled:pointer-events-none disabled:opacity-50"
        >
          Dashboard
        </button>
      </div>
    );
  }
  return (
    <div className={"flex flex-col gap-4 w-fit py-4"}>
      <p className={"text-gray-500 md:text-xl"}>Enter your email to view your dashboard</p>
      <input
        type="email"
        className="w-full h-12 px-4 text-sm text-gray-900 placeholder-gray-500 bg-gray-100 border-2 border-gray-100 rounded-lg"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
      />
      <button
        onClick={() => {
          submit();
        }}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 disabled:pointer-events-none disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};
