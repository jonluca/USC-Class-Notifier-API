import { convert } from "html-to-text";
import type { PipeableStream, ReactDOMServerReadableStream } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { plainTextSelectors } from "./plain-text-selectors";
import type { Options } from "./options";
import { Writable } from "node:stream";
import type { ReactNode } from "react";
const decoder = new TextDecoder("utf-8");

const readStream = async (stream: PipeableStream | ReactDOMServerReadableStream) => {
  let result = "";

  if ("pipeTo" in stream) {
    // means it's a readable stream
    const writableStream = new WritableStream({
      write(chunk: BufferSource) {
        result += decoder.decode(chunk);
      },
    });
    await stream.pipeTo(writableStream);
  } else {
    const writable = new Writable({
      write(chunk: BufferSource, _encoding, callback) {
        result += decoder.decode(chunk);

        callback();
      },
    });
    stream.pipe(writable);

    return new Promise<string>((resolve, reject) => {
      writable.on("error", reject);
      writable.on("close", () => {
        resolve(result);
      });
    });
  }

  return result;
};

export const renderAsync = async (component: ReactNode, options?: Options) => {
  let html!: string;
  await new Promise<void>((resolve, reject) => {
    const stream = renderToPipeableStream(component as any, {
      async onAllReady() {
        html = await readStream(stream);
        resolve();
      },
      onError(error) {
        reject(error as Error);
      },
    });
  });

  if (options?.plainText) {
    return convert(html, {
      selectors: plainTextSelectors,
      ...options.htmlToTextOptions,
    });
  }

  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

  const document = `${doctype}${html}`;

  return document;
};
