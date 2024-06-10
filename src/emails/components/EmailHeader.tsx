import { Img, Link, Section } from "@react-email/components";
import * as React from "react";

const EmailHeader = () => {
  return (
    <Section>
      <Link href="https://usc.jonlu.ca" className="mx-auto">
        <Img
          src={`https://usc.jonlu.ca/logo.png`}
          width="150"
          height="100"
          alt="USC Schedule Helper"
          className="mx-auto rounded-lg object-contain"
        />
      </Link>
    </Section>
  );
};

export default EmailHeader;
