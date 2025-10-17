import { Section, Link, Text } from "@react-email/components";
import * as React from "react";

const EmailFooter = () => {
  return (
    <Section className="text-center mt-[12px]">
      <Text className="text-black text-xs text-center font-bold p-0 my-0 mx-0">
        Made with ❤️ by{" "}
        <Link className={"underline text-black"} href={"https://www.instagram.com/jonlucadecaro/"}>
          JonLuca DeCaro
        </Link>
      </Text>
    </Section>
  );
};

export default EmailFooter;
