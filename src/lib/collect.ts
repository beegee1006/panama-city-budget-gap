/** Web app URL from the Apps Script deployment. Empty until that deployment exists. */
export const RESPONSE_WEB_APP = "";

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
};

/** Post into a hidden frame. Apps Script web apps do not allow a normal fetch from another site. */
export function submitPostcard(body: PostcardResponse) {
  if (!RESPONSE_WEB_APP) {
    return Promise.reject(new Error("The response file is not connected yet."));
  }
  return new Promise<void>((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.name = "pc-response-frame";
    frame.hidden = true;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = RESPONSE_WEB_APP;
    form.target = frame.name;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(body);
    form.append(input);
    document.body.append(frame, form);
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      form.remove();
      frame.remove();
      if (ok) resolve();
      else reject(new Error("Could not save the response"));
    };
    const timer = window.setTimeout(() => finish(false), 15000);
    frame.addEventListener("load", () => {
      frame.addEventListener("load", () => finish(true), { once: true });
      form.submit();
    }, { once: true });
    frame.src = "about:blank";
  });
}
