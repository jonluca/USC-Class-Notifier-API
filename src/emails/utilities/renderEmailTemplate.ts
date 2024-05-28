import { renderAsync } from "../email-render/render-async";
import type React from "react";

const renderEmailTemplate = async (email: React.ReactElement) => {
  const renderedEmail = await renderAsync(email, {
    pretty: true,
  });

  return renderedEmail;
};

export default renderEmailTemplate;
