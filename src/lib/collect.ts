/** Publisher inbox. FormSubmit emails each response here. The address is in the public script on purpose so the static page can submit. */
const INBOX = "BrianGrainger11@gmail.com";

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

export async function submitPostcard(body: PostcardResponse) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(INBOX)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Panama City budget postcard",
      _template: "table",
      _captcha: "false",
      ...body,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: string; message?: string };
  if (!res.ok || data.success === "false") {
    throw new Error(data.message || "Could not save the response");
  }
  return data;
}
