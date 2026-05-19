import { cache } from "react";
import { auth } from "@/auth";

/**
 * Cached auth() wrapper — memoized per request so the layout and page
 * both calling auth() only hits the JWT validation once per render cycle.
 */
export const getCachedSession = cache(auth);
