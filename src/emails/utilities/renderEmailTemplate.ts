import { renderAsync } from "@react-email/render";
import type React from "react";

const renderEmailTemplate = async (email: React.ReactElement) => {
  const renderedEmail = await renderAsync(email, {
    pretty: true,
  });

  return renderedEmail;
};

export default renderEmailTemplate;
