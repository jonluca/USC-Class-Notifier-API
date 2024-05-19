import { Body, Container, Head, Html, Preview } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";
import EmailFooter from "./EmailFooter";
import EmailHeader from "./EmailHeader";

const EmailBase = ({
  previewText,
  children,
  hideHeader,
}: {
  previewText: string;
  children: React.ReactNode;
  hideHeader?: boolean;
}) => {
  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 my-auto mx-auto font-sans p-2 rounded-3xl">
          <Container className="rounded-3xl bg-white mx-auto md:mt-8 p-[20px] max-w-[465px]">
            {!hideHeader && <EmailHeader />}
            {children}
          </Container>
          <EmailFooter />
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailBase;
