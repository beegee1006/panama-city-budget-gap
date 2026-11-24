/** Web app URL from the Apps Script deployment. */
export const RESPONSE_WEB_APP =
  "https://script.google.com/macros/s/AKfycbwY4ygYu_LIDVz_4jpk0Nhu5f06r19XhZRLG4uuKxP-qDKNfkqlfNITMh7_YUQL6A4duQ/exec";

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

/**
 * Apps Script web apps reject a normal JSON fetch from another site.
 * A form-encoded POST is allowed, and no-cors keeps the browser from
 * cancelling it when the response can't be read.
 */
export async function submitPostcard(body: PostcardResponse) {
  if (!RESPONSE_WEB_APP) {
    throw new Error("The response file is not connected yet.");
  }
  const payload = new URLSearchParams();
  payload.set("payload", JSON.stringify(body));
  await fetch(RESPONSE_WEB_APP, {
    method: "POST",
    mode: "no-cors",
    redirect: "follow",
    keepalive: true,
    body: payload,
  });
}
