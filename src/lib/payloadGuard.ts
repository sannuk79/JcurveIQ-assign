import { buildShape } from "payload-guard-filter";

// Pre-defined shapes - works in CSR and SSR both
export const login = buildShape({ password: "string", token: "string", api_key: "string" });
export const register = buildShape({ username: "string", email: "string", password: "string" });
export const payload = buildShape({ data: "string", message: "string", value: "string" });
