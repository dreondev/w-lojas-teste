import { Html, Head, Main, NextScript, DocumentContext } from "next/document";

interface DocumentProps {
  title?: string;
  description?: string;
  favIcon?: string;
  image?: string;
}

export default function Document({ title, description, favIcon, image }: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        {favIcon && <link rel="icon" href={favIcon} />}
        <title>{title || "404 - Loja não encontrada"}</title>
        {description && <meta name="description" content={description} />}
        {image && <meta property="og:image" content={image} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        {image && <meta name="twitter:card" content="summary_large_image" />}
        {title && <meta name="twitter:title" content={title} />}
        {description && <meta name="twitter:description" content={description} />}
        {image && <meta name="twitter:image" content={image} />}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await ctx.renderPage();

  if (!ctx.req) {
    return initialProps;
  }

  const getFirstSubdomain = (host: string | undefined): string => {
    if (!host) return "";
    const parts = host.split(".");
    return parts.length > 1 ? parts[0] : host;
  };

  const subOrDomain = getFirstSubdomain(ctx.req.headers.host);

  const getStoreIdRes = await fetch(
    `https://api.wizesale.com/v1/store?subOrDomain=${subOrDomain}`
  );
  const storeIdData = await getStoreIdRes.json();

  if (!storeIdData || !storeIdData.store) {
    return initialProps;
  }

  const storeResponse = await fetch(`https://api.wizesale.com/v1/store`, {
    headers: {
      Cookie: `storeId=${storeIdData.store.id};`,
    },
  });

  const data = await storeResponse.json();

  return {
    ...initialProps,
    title: data.store.title,
    description: data.store.description,
    favIcon: data.store.favIcon,
    image: data.store.image,
  };
};
