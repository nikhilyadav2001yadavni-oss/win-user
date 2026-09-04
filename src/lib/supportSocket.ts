"use client";

import { io, type Socket } from "socket.io-client";

const SOCKET_PATH = "/api/v1/support-tickets/socket.io";

function getSocketOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SOCKET_ORIGIN?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);

      return `${url.protocol}//${url.host}`;
    } catch {
      // Ignore invalid URL and use fallback.
    }
  }

  return "http://127.0.0.1:3001";
}

export function createSupportTicketSocket(
  token: string
): Socket {
  if (!token) {
    throw new Error(
      "Socket authentication token is required"
    );
  }

  const origin = getSocketOrigin();

  console.log("[support socket] connecting:", {
    origin,
    path: SOCKET_PATH,
  });

  return io(origin, {
    path: SOCKET_PATH,

    auth: {
      token,
    },

    transports: ["websocket", "polling"],

    autoConnect: true,

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    timeout: 10000,
  });
}



// "use client";

// import { io, type Socket } from "socket.io-client";

// const SOCKET_ORIGIN =
//     process.env.NEXT_PUBLIC_API_BASE_URL ||
//     "http://144.172.116.218:3000/api/v1";

// export function createSupportTicketSocket(token?: string): Socket {
//     return io(SOCKET_ORIGIN.replace(/\/+$/, ""), {
//         path: "/support-tickets/socket.io",
//         auth: token ? { token } : undefined,
//         transports: ["websocket", "polling"],
//         autoConnect: true,
//         reconnection: true,
//         reconnectionAttempts: Infinity,
//         reconnectionDelay: 1000,
//     });
// }
