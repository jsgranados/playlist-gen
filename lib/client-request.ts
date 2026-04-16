import type { WorkflowResult } from "@/lib/types";

type WorkflowResponse = { error?: string } & WorkflowResult;

export type WorkflowOutcome =
  | { ok: true; result: WorkflowResult }
  | { ok: false; error: string };

export async function submitWorkflow(
  endpoint: string,
  body: BodyInit,
  headers: HeadersInit,
  fallbackError: string
): Promise<WorkflowOutcome> {
  const response = await fetch(endpoint, { method: "POST", headers, body });
  const payload = (await response.json()) as WorkflowResponse;

  if (!response.ok) {
    return { ok: false, error: payload.error ?? fallbackError };
  }

  return { ok: true, result: payload };
}
