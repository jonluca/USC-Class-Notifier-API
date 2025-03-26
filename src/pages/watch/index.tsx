import Dashboard from "@/components/Dashboard";
import React from "react";
import { cookieKey } from "@/server/auth";
import type { GetServerSideProps } from "next";
import { setCookie } from "@/server/utils/cookie";
import dayjs from "dayjs";
import { prisma } from "@/server/db";

export default ({ didSucceed, section }: { section: string; didSucceed: boolean }) => {
  return <Dashboard section={section} didSucceedInWatchingSection={didSucceed} />;
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const key = context.query.key;
  const section = context.query.section;
  if (key && context.res) {
    setCookie(context.res, cookieKey, key as string, {
      expires: dayjs().add(1, "year").toDate(),
      httpOnly: false,
    });
  }
  let didSucceed = false;
  if (section) {
    try {
      await prisma.watchedSection.update({
        where: {
          id: section as string,
        },
        data: {
          notified: false,
        },
      });
      didSucceed = true;
    } catch {}
  }
  return {
    props: { didSucceed, section },
  };
};
