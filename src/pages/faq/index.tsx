import type { NextPage } from "next";
import React, { useState } from "react";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
const FaqEntry = ({ question, answer }: { question: string; answer: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={"flex flex-col items-center w-full"}>
      <div className="flex items-center justify-between space-x-4 px-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <h4 className="text-lg font-semibold">{question}</h4>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
          type="button"
          aria-controls="radix-:r18:"
          aria-expanded="false"
          data-state="closed"
        >
          {open ? <ArrowUpward /> : <ArrowDownward />}
          <span className="sr-only">Toggle</span>
        </button>
      </div>
      {open && answer}
    </div>
  );
};

const TermsOfService: NextPage = () => {
  return (
    <div>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h1>
          </div>
          <div className="mt-8 space-y-4">
            <FaqEntry
              question="Why am I not getting notifications?"
              answer={
                <p className={"prose"}>
                  The way the app works is that it refreshes class data every 5 minutes. Unfortunately, if spots open up
                  and a student registers for it in a 5 minute time frame, my service will never know a spot was open.{" "}
                  {"It's"} only once a spot is open for more than 5 minutes that {"it'll"} notify you.
                  <br />
                  <br />
                  Additionally, the service relies on USCs class API - this is the service that provides the information
                  of class information, and it is not run by me. Sometimes their service is laggy, or {"doesn't"} update
                  perfectly. In these cases I {"don't"} have any control over the information. <br />
                  <br />
                  This is why the service is marked as beta and says that it is not guaranteed to work. For crucial
                  classes, for instance those needed to graduate, I recommend also manually checking it once a day.{" "}
                  <br />
                  <br />
                  Also a few notes - if a class {"hasn't"} opened up spots yet, it {"won't"} work, as it {"won't"} know
                  if the spots {"haven't"}
                  been released or if {"they're"} full yet, and will just continuously spam you with emails.
                  <br />
                  <br />
                  If you {"haven't"} received text messages but have paid for them, make sure I have liked your Venmo
                  payment and that the body of the Venmo payment is only your email address, and that email address
                  matches the email you signed up for notifications with. <br />
                  <br />
                  As a reminder, this is just a service I, a student at USC, made in my spare time. {"It's"} not a
                  company, or an
                  {`"official"`} thing - {"it's"} just a CS students side project, so please keep that in mind!
                  <br />
                  <br />
                </p>
              }
            />
            <FaqEntry
              question="Do I need to pay again if I got a text message"
              answer={
                <>
                  <p className={"prose pb-2"}>
                    No - every $1 is good for unlimited text messages for 1 section of 1 class for that semester. So if{" "}
                    {"you're"}
                    watching CSCI-103 section 123, and you get a text message, you {"don't"} need to pay again to watch
                    CSCI-103 section 123. If you want to watch section 124, you would need to pay another $1.
                  </p>
                  <p className={"prose"}>
                    If you registered for a class that is not full, and still has spots that just have not been opened
                    yet, this will <i>not work.</i> Please contact <a href="mailto:jdecaro@usc.edu">jdecaro@usc.edu</a>{" "}
                    if you have any issues.
                  </p>
                </>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
