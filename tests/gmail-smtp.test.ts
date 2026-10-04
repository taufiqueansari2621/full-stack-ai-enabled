// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { submitGmail, type MailConnector } from "../worker/mail/smtp";

function fixture(rejectAuth = false) {
  const commands: string[] = [];
  const connections: unknown[] = [];
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value;
      controller.enqueue(encoder.encode("220 smtp ready\r\n"));
    },
  });
  const connect: MailConnector = (address, options) => {
    connections.push({ address, options });
    return {
      readable,
      closed: Promise.resolve(),
      async close() {
        if (!closed) {
          closed = true;
          controller.close();
        }
      },
      writable: new WritableStream<Uint8Array>({
        write(bytes) {
          const text = new TextDecoder().decode(bytes);
          commands.push(text);
          const reply = text.startsWith("EHLO")
            ? "250-smtp\r\n250 AUTH PLAIN\r\n"
            : text.startsWith("AUTH")
              ? rejectAuth
                ? "535 denied\r\n"
                : "235 accepted\r\n"
              : text.startsWith("DATA")
                ? "354 continue\r\n"
                : "250 accepted\r\n";
          controller.enqueue(encoder.encode(reply.slice(0, 4)));
          controller.enqueue(encoder.encode(reply.slice(4)));
        },
      }),
    };
  };
  return { connect, commands, connections, isClosed: () => closed };
}
describe("fixed Gmail SMTP transport", () => {
  it("bounds a stalled connection to twenty seconds", async () => {
    vi.useFakeTimers();
    try {
      const close = vi.fn(async () => undefined);
      const connect: MailConnector = () => ({
        readable: new ReadableStream(),
        writable: new WritableStream(),
        closed: Promise.resolve(),
        close,
      });
      const result = submitGmail(
        connect,
        "abcdefghijklmnop",
        "test@example.invalid",
        "Subject",
        "body",
      );
      const assertion = expect(result).rejects.toThrow("MAIL_TIMEOUT");
      await vi.advanceTimersByTimeAsync(20000);
      await assertion;
      expect(close).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
  it("uses encrypted port 465, fixed sender and encoded UTF8 content", async () => {
    const socket = fixture();
    await submitGmail(
      socket.connect,
      "abcd efgh ijkl mnop",
      "test@example.invalid",
      "Verify your Forge email",
      "Unicode: ✓",
    );
    expect(socket.connections).toEqual([
      {
        address: { hostname: "smtp.gmail.com", port: 465 },
        options: { secureTransport: "on" },
      },
    ]);
    expect(socket.commands[2]).toContain("MAIL FROM:<zerotoaiforge@gmail.com>");
    expect(socket.commands.at(-1)).toContain(
      "Content-Transfer-Encoding: base64",
    );
    expect(socket.commands.at(-1)).toContain(
      btoa(String.fromCharCode(...new TextEncoder().encode("Unicode: ✓"))),
    );
    expect(socket.isClosed()).toBe(true);
  });
  it("rejects header injection before connecting", async () => {
    const socket = fixture();
    await expect(
      submitGmail(
        socket.connect,
        "abcdefghijklmnop",
        "test@example.invalid\r\nBcc: victim@example.invalid",
        "Subject",
        "body",
      ),
    ).rejects.toThrow("MAIL_CONFIGURATION_INVALID");
    expect(socket.connections).toHaveLength(0);
  });
  it("fails closed on provider rejection without sending a message", async () => {
    const socket = fixture(true);
    await expect(
      submitGmail(
        socket.connect,
        "abcdefghijklmnop",
        "test@example.invalid",
        "Subject",
        "body",
      ),
    ).rejects.toThrow("MAIL_PROVIDER_REJECTED");
    expect(socket.commands.some((value) => value.startsWith("DATA"))).toBe(
      false,
    );
    expect(socket.isClosed()).toBe(true);
  });
});
