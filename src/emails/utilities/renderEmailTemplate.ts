import type React from "react";
import { render, pretty } from "@react-email/render";

const renderEmailTemplate = async (email: React.ReactElement) => {
  const html = await pretty(await render(email));
  return html;
};

export default renderEmailTemplate;
