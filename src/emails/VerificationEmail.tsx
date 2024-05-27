import { Button, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailBase from "./components/EmailBase";
import { baseDomain } from "@/constants";

interface VerificationEmailProps {
  key: string;
  isVerifiedAlready?: boolean;
}
const VerificationEmail = ({ isVerifiedAlready, key }: VerificationEmailProps) => {
  const previewText = isVerifiedAlready ? "Sign in" : "🎉 Welcome to the USC Schedule Helper!";
  return (
    <EmailBase previewText={previewText}>
      <Text className="text-black text-[24px] font-bold text-center p-0 mt-6 mx-0">{previewText}</Text>
      <Section className="mx-auto mt-6">
        <Row>
          <Text className="text-black text-[16px] px-2 m-0">
            {isVerifiedAlready
              ? "You're all set to start using the USC Schedule Helper. Click the button below to sign in."
              : "Verify your email to begin using the USC Schedule Helper."}
          </Text>
        </Row>
      </Section>
      <Button
        className="bg-black rounded-xl text-white font-bold no-underline text-center py-2 w-full text-lg mt-4"
        href={`${baseDomain}/verify?key=${key}`}
      >
        {isVerifiedAlready ? "Sign in" : "Verify"}
      </Button>
    </EmailBase>
  );
};

VerificationEmail.PreviewProps = { isVerifiedAlready: true, key: "asdf" } as VerificationEmailProps;

export default VerificationEmail;
