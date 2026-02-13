import { z } from "zod";

export const nonEmptyString = z.string().min(1);
export const urlString = z.string().url();
