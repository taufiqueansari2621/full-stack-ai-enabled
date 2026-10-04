export type MailSocket = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  close(): Promise<void>;
  closed: Promise<void>;
};
export type MailConnector = (
  address: { hostname: string; port: number },
  options: { secureTransport: "on" },
) => MailSocket;

export const GMAIL_SENDER = "zerotoaiforge@gmail.com";
export function mailAddress(value: string) {
  return (
    value.length <= 254 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      value,
    )
  );
}

export async function submitGmail(
  connect: MailConnector,
  password: string,
  recipient: string,
  subject: string,
  body: string,
) {
  const secret = password.replace(/\s/g, "");
  if (
    !/^[A-Za-z0-9]{16}$/.test(secret) ||
    !mailAddress(recipient) ||
    /[\r\n]/.test(subject) ||
    !/^[\x20-\x7e]{1,100}$/.test(subject) ||
    body.length > 8192
  )
    throw new Error("MAIL_CONFIGURATION_INVALID");
  const socket = connect(
    { hostname: "smtp.gmail.com", port: 465 },
    { secureTransport: "on" },
  );
  // Socket failures must not become unhandled rejections or disclose replies.
  void socket.closed.catch(() => undefined);
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";
  let timedOut = false;
  let deadline: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    deadline = setTimeout(() => {
      timedOut = true;
      reject(new Error("MAIL_TIMEOUT"));
      void reader.cancel().catch(() => undefined);
      void writer.abort().catch(() => undefined);
      void socket.close().catch(() => undefined);
    }, 20000);
  });
  async function reply(expected: number) {
    let size = 0;
    let lines = 0;
    while (true) {
      let end = buffered.indexOf("\r\n");
      while (end < 0) {
        const next = await reader.read();
        if (next.done || timedOut) throw new Error("MAIL_CONNECTION_FAILED");
        buffered += decoder.decode(next.value, { stream: true });
        if (buffered.length > 16384) throw new Error("MAIL_REPLY_TOO_LARGE");
        end = buffered.indexOf("\r\n");
      }
      const line = buffered.slice(0, end);
      buffered = buffered.slice(end + 2);
      size += line.length;
      if (
        ++lines > 100 ||
        size > 16384 ||
        !new RegExp(`^${expected}[ -]`).test(line)
      )
        throw new Error("MAIL_PROVIDER_REJECTED");
      if (line[3] === " ") return;
    }
  }
  const command = async (line: string, code: number) => {
    await writer.write(encoder.encode(line + "\r\n"));
    await reply(code);
  };
  const transaction = async () => {
    await reply(220);
    await command("EHLO forge-ai-engineering.workers.dev", 250);
    await command("AUTH PLAIN " + btoa(`\0${GMAIL_SENDER}\0${secret}`), 235);
    await command(`MAIL FROM:<${GMAIL_SENDER}>`, 250);
    await command(`RCPT TO:<${recipient}>`, 250);
    await command("DATA", 354);
    const encoded =
      btoa(String.fromCharCode(...encoder.encode(body)))
        .match(/.{1,76}/g)
        ?.join("\r\n") ?? "";
    await command(
      `From: Forge <${GMAIL_SENDER}>\r\nTo: <${recipient}>\r\nSubject: ${subject}\r\nDate: ${new Date().toUTCString()}\r\nMessage-ID: <${crypto.randomUUID()}@gmail.com>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encoded}\r\n.`,
      250,
    );
  };
  try {
    await Promise.race([transaction(), timeout]);
  } finally {
    clearTimeout(deadline!);
    // Cleanup cannot extend the total deadline if the transport stalls.
    void socket.close().catch(() => undefined);
    void reader.cancel().catch(() => undefined);
    void writer.abort().catch(() => undefined);
  }
}
