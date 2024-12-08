import { FiShoppingCart, FiMenu, FiFileText, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaShoppingBasket, FaRegStar } from "react-icons/fa";
import * as React from "react";
import { GetServerSideProps } from "next";
import { useCart } from "react-use-cart";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import _ from "lodash";
import { Minus, Plus } from "lucide-react";
import Router from "next/router";
import { parseCookies, setCookie } from "nookies";

interface PageProps {
  store: any;
}

function calculateDiscount(price: number, discount: number) {
  const discountAmount = _.subtract(price, discount);

  const discountPercentage = (_.divide(discountAmount, price) * 100).toFixed(0);

  return discountPercentage === "-Infinity" ? "0" : discountPercentage;
}

export default function TermsOfService({ store }: PageProps) {
  React.useEffect(() => {
    const cookies = parseCookies();

    if (!cookies.storeId && store?.id) {
      setCookie(null, "storeId", store.id, {
        maxAge: 12 * 60 * 60,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }, [store]);

  React.useEffect(() => {
    if (store.backgroundImage) {
      document.body.style.setProperty("--background-url", `url(${store.backgroundImage})`);
    }

    return () => {
      document.body.style.removeProperty('--background-url')
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { isEmpty, items, updateItemQuantity, removeItem, cartTotal } =
    useCart();

  const [favoritedProducts, setFavoritedProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = sessionStorage.getItem("favoritedProducts");
      if (storedFavorites) {
        setFavoritedProducts(JSON.parse(storedFavorites));
      }
    }
  }, []);

  return (
    <main className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-40 3xl:mx-64 flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 bg-transparent backdrop-blur-[10px] border-b border-slate-900 flex-wrap md:flex-nowrap">
        <div className="flex items-center mb-2 md:mb-0">
          <img
            src={store.logo}
            alt="Logo"
            className="h-10 mr-4 rounded-[10px]"
          />
          <span className="font-medium text-[17px] text-white">
            {store.title}
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-2 mb-2 md:mb-0">
          <a
            href="/"
            className="border border-slate-900 text-white py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-gray-700 transition-colors"
          >
            <FiShoppingCart className="w-4 h-4 mr-1" />
            <span>Loja</span>
          </a>
          <a
            href="/terms"
            className="bg-blue-700 hover:bg-blue-600 text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 transition-colors"
          >
            <FiFileText className="w-4 h-4 mr-1" />
            <span>Termos</span>
          </a>
          <a
            href="/feedbacks"
            className="bg-transparent font-normal text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-gray-700 transition-colors"
          >
            <FaRegStar className="text-white w-4 h-4 mr-1" />
            <span>Avaliações</span>
          </a>
        </nav>

        <div className="font-medium flex items-center relative">
          <Sheet>
            <SheetTrigger asChild>
              <FaHeart className="w-10 h-4 cursor-pointer hover:text-red-500 mr-2" />
            </SheetTrigger>
            <SheetContent className="p-4 rounded-lg flex flex-col overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-white">Favoritos</SheetTitle>
              </SheetHeader>
              {favoritedProducts.length === 0 ? (
                <p className="text-white text-center mt-10">
                  Nada por aqui ainda...
                </p>
              ) : (
                favoritedProducts.map((item) => (
                  <div
                    onClick={() => { Router.push(`/product/${item.id}`) }}
                    key={item.id}
                    className="hover:cursor-pointer flex items-center justify-between py-4 border-b border-slate-900"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg"
                      />
                      <div>
                        <h3 className="text-white text-sm font-semibold">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <FaShoppingBasket className="w-10 h-4 cursor-pointer hover:text-blue-500 mr-2" />
            </SheetTrigger>
            <SheetContent className="p-4 rounded-lg flex flex-col overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-white">Carrinho</SheetTitle>
              </SheetHeader>
              {isEmpty ? (
                <p className="text-white text-center mt-10">
                  O carrinho está vazio.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 border-b border-slate-900"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg"
                      />
                      <div>
                        <h3 className="text-white text-sm font-semibold">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 line-through text-xs">
                          De: R$ {item.comparation?.toFixed(2).replace(".", ",") || "0,00"}
                        </p>
                        <p className="text-red-500 text-sm">
                          R$ {item.price.toFixed(2).replace(".", ",")}{" "}
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                            {calculateDiscount(
                              item.comparation,
                              item.price
                            )}
                            %
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const quantity = item.quantity ?? 0;
                          if (quantity > 1) {
                            updateItemQuantity(item.id, quantity - 1);
                          }
                        }}
                        className="text-white border border-slate-900 p-1 rounded-lg hover:bg-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const quantity = item.quantity ?? 0;
                          updateItemQuantity(item.id, quantity + 1);
                        }}
                        className="text-white border border-slate-900 p-1 rounded-lg hover:bg-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              {isEmpty ? null : (
                <div className="max-h-[200px]">
                  <div className="flex justify-between">
                    <span className="text-white">
                      Valor total à pagar:
                    </span>
                    <span className="text-white">
                      R$ {cartTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              )}
              {isEmpty ? null : (
                <SheetFooter className="flex flex-col mt-4">
                  <button onClick={() => { window.location.href = "/checkout" }} className="w-full border border-slate-900 text-white font-bold py-2 rounded-full hover:bg-slate-800">
                    Ir para compra
                  </button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <FiMenu
          className="w-6 h-6 text-white md:hidden block"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#050e16] text-white z-10 md:hidden">
            <ul className="flex flex-col items-start p-4 space-y-4">
              <li>
                <a href="/" className="flex items-center space-x-2">
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Loja</span>
                </a>
              </li>
              <li>
                <a href="/terms" className="flex items-center space-x-2">
                  <FiFileText className="w-4 h-4" />
                  <span>Termos</span>
                </a>
              </li>
              <li>
                <a href="/feedbacks" className="flex items-center space-x-2">
                  <FaRegStar className="text-white w-4 h-4" />
                  <span>Avaliações</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      <section className="p-4 md:p-8 text-white flex-1">
        <h1 className="text-2xl font-bold mb-4">Termos de Serviço</h1>
        <p className="mb-4">
          Estes Termos de Serviço ("Termos") regem seu acesso e uso de nossos
          serviços, incluindo nosso site, produtos, e quaisquer outras
          interações que você tenha com a {store.title}.
        </p>
        <hr className="mb-6 border-slate-900" />

        <div className="space-y-4">
          {store.terms && store.terms.split('\n').map((line: any, index: number) => {
            if (index === 0 || line.match(/^[0-9]+\./)) {
              return (
                <div key={index}>
                  <span className="font-semibold text-lg">{line}</span>
                </div>
              );
            } else {
              return (
                <div key={index}>
                  <p className="mt-2 text-sm">{line}</p>
                </div>
              );
            }
          })}
        </div>
      </section>


      <footer className="py-4 border-t border-slate-900 text-center">
        <p className="text-white text-sm font-normal">
          Site desenvolvido com{" "}
          <span className="text-blue-600 font-bold hover:cursor-pointer hover:underline"><span onClick={() => { Router.push("https://wizesale.com") }} className="font-bold">Wizesale</span>.</span>
        </p>
      </footer>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {

  const getFirstSubdomain = (host: string | undefined): string => {
    if (!host) return "";
    const parts = host.split(".");
    return parts.length > 1 ? parts[0] : host;
  };

  const subOrDomain = getFirstSubdomain(context.req.headers.host);

  const getStoreIdRes = await fetch(`https://api.wizesale.com/v1/store?subOrDomain=${subOrDomain}`)
  const storeIdData = await getStoreIdRes.json()

  if (!storeIdData || !storeIdData.store) {
    return {
      notFound: true,
    };
  }

  const storeResponse = await fetch(`https://api.wizesale.com/v1/store`, {
    headers: {
      Cookie: `storeId=${storeIdData.store.id};`,
    },
  });

  const storeData = await storeResponse.json();

  return {
    props: {
      store: storeData.store || null,
    },
  };
};