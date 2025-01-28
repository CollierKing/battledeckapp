// MARK: - MISC
export default async function readableStreamToBlob(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks = [];

  let done = false;
  while (!done) {
    const { value, done: streamDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = streamDone;
  }

  return new Blob(chunks);
}
