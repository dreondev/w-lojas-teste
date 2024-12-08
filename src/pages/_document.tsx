import { Html, Head, Main, NextScript, DocumentContext } from "next/document";

interface DocumentProps {
  title?: string; // Adiciona propriedades opcionais, se necessário
}

export default function Document({ title }: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        <title>{title || "Título Padrão"}</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// getInitialProps para adicionar propriedades dinâmicas
Document.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await ctx.renderPage();

  // Simulação de obtenção de dados dinâmicos
  const dynamicTitle = "Título Dinâmico do Servidor";

  return {
    ...initialProps,
    title: dynamicTitle, // Adicione propriedades aqui
  };
};
