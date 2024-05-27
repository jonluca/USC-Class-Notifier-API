import type { NextApiRequest, NextApiResponse } from "next";
import { runRefresh } from "@/server/api/controller";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runRefresh();
  res.status(200).end("ok");
}
