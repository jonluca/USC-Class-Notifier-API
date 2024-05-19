import superjson from "superjson";

const compressedSerializer = {
  serialize: (object: object) => {
    return superjson.serialize(object);
  },
  deserialize: (object: any) => {
    try {
      return superjson.deserialize(object);
    } catch (e) {
      // check if object is an html string
      if (typeof object === "string" && object.startsWith("<")) {
        console.error("Received HTML instead of JSON");
        console.error(e);
        throw new Error("Received HTML instead of JSON");
      }
      throw e;
    }
  },
} as const;
export const transformer = {
  input: compressedSerializer,
  output: compressedSerializer,
};
