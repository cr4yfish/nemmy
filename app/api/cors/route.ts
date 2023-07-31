export async function GET(req: any, res: any) {
  const { url } = req.query;
  try {
    const resProxy = await fetch(url);

    return new Response(JSON.stringify(resProxy.body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request, res: any) {
  const params = new URL(req.url).searchParams;
  const url = params.get("url") || "";
  const auth = params.get("auth") as string;

  const host = `https://${new URL(url).host}`;

  const form = await req.formData();

  const header = req.headers;
  try {
    const resProxy = await fetch(url, {
      method: "POST",
      headers: {
        ...header, // Include original headers
        origin: host, // Fake same-origin
        cookie: `jwt=${auth}`, // Set auth cookie
      },
      body: form,
    });

    return new Response(JSON.stringify(resProxy.body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
