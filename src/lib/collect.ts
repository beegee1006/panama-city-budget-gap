/** Web app URL from the Apps Script deployment. */
export const RESPONSE_WEB_APP =
  "https://script.google.com/macros/s/AKfycbw_9tnPlXPIq_AImYgWCgapJ68cvRcN7uwDjD2POt4oxh0vjf234LY2hqV88LPBzVQY/exec";

export type PostcardResponse = {
  name: string;
  email: string;
  year: string;
  assessed: string;
  cityTaxSavings2027: string;
  cityTaxSavings2028: string;
  gap: string;
  cuts: string;
  revenue: string;
  closed: string;
  grid: string;
};

/** A real form post. The iframe stays on the page so the browser does not cancel it. */
export function submitPostcard(body: PostcardResponse) {
  if (!RESPONSE_WEB_APP) {
    return Promise.reject(new Error("The response file is not connected yet."));
  }
  let frame = document.getElementById("pc-response-frame") as HTMLIFrameElement | null;
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "pc-response-frame";
    frame.name = "pc-response-frame";
    frame.hidden = true;
    document.body.append(frame);
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = RESPONSE_WEB_APP;
  form.target = frame.name;
  form.acceptCharset = "UTF-8";
  const fields: Record<string, string> = {
    name: body.name,
    email: body.email,
    year: body.year,
    assessed: body.assessed,
    savings2027: body.cityTaxSavings2027,
    savings2028: body.cityTaxSavings2028,
    gap: body.gap,
    closed: body.closed,
    cuts: body.cuts,
    revenue: body.revenue,
    payload: JSON.stringify(body),
    grid: body.grid,
  };
  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.append(input);
  }
  document.body.append(form);
  form.submit();
  form.remove();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, 2000);
  });
}
