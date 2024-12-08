import { FiShoppingCart, FiMenu, FiFileText, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaShoppingBasket, FaRegStar } from "react-icons/fa";

import * as React from "react";
import { Check, ChevronsUpDown, Minus, Plus, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GetServerSideProps } from "next";
import _ from "lodash";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "react-use-cart";
import Router from "next/router";
import { parseCookies, setCookie } from "nookies";

function calculateDiscount(price: number, discount: number) {
  const discountAmount = _.subtract(price, discount);

  const discountPercentage = (_.divide(discountAmount, price) * 100).toFixed(0);

  return discountPercentage === "-Infinity" ? "0" : discountPercentage;
}

interface Category {
  id: number;
  name: string;
  description: string;
  productsCount: number;
  createdAt: string;
  products: any[];
}

interface PageProps {
  products: any;
  categories: Category[];
  store: any;
}

export default function Home({ products, store, categories }: PageProps) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory = value ? product.category === value : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = product.visibility === "public" || product.visibility === "Publico";
    return matchesCategory && matchesSearch && matchesVisibility;
  });

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

  React.useEffect(() => {
    if (store.backgroundImage) {
      document.body.style.setProperty("--background-url", `url(${store.backgroundImage})`);
    }

    return () => {
      document.body.style.removeProperty('--background-url')
    };
  }, []);

  return (
    <>
      {store?.announCard?.activated && (
        <div className="z-10 bg-blue-600 text-white text-center py-2 font-semibold text-sm w-full">
          {store.announCard.text}
        </div>
      )}
      <main className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-40 3xl:mx-64 flex flex-col min-h-screen">
        <header className="flex justify-between items-center p-4 bg-transparent backdrop-blur-[10px] border-b border-slate-900 flex-wrap md:flex-nowrap">
          <div className="flex items-center mb-2 md:mb-0">
            <img
              src={store?.logo}
              alt="Logo"
              className="h-10 mr-4 rounded-[10px]"
            />
            <span className="font-medium text-[17px] text-white">
              {store?.title}
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-2 mb-2 md:mb-0">
            <a
              href="/"
              className="border border-slate-900 bg-blue-700 text-white py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-blue-600 transition-colors"
            >
              <FiShoppingCart className="w-4 h-4 mr-1" />
              <span>Loja</span>
            </a>
            <a
              href="/terms"
              className="bg-transparent text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-gray-700 transition-colors"
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

          <div className="font-medium flex items-center relative mr-[-20px] md:mr-0">
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
            className="w-6 h-6 text-white md:hidden block mr-[-10px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#050e16] text-white md:hidden">
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

        {store?.banner && (
          <img className="w-full max-w-[1100px] mt-8 rounded-lg h-full max-h-[150px] mb-8 items-center self-center justify-center" src={store?.banner} alt="banner" />
        )}

        <section className="relative flex-1 p-4 md:p-8 text-white">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">{store?.title}</h1>
            <p className="text-gray-400">
              {store?.description}
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-0">
              <span className="text-zinc-400 font-medium">Categoria:</span>{" "}
              {value || "Nenhuma"}
            </h2>

            <div className="flex space-x-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[200px] justify-between bg-[#050e16] border-slate-900"
                  >
                    {value
                      ? categories.find((category: Category) => category.name === value)?.name
                      : "Categorias"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 bg-[#050e16] border-slate-900">
                  <Command>
                    <CommandInput placeholder="Pesquise aqui" />
                    <CommandList>
                      <CommandEmpty>Categoria não encontrada</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category: Category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={(currentValue) => {
                              setValue(currentValue === value ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === category.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <input
                type="text"
                placeholder="Procure pelo produto"
                className="bg-[#050e16] text-white p-2 rounded-lg w-full md:w-[300px] placeholder-gray-500 border border-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <hr className="mb-6 border-slate-900" />

          <div className="p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product: any) => (
                <div
                  onClick={() => { window.location.href = `/product/${product.id}` }}
                  key={product.id}
                  className="hover:cursor-pointer relative group bg-[#050e16] h-64 rounded-lg border border-slate-900 overflow-hidden"
                >
                  <div className="overflow-hidden h-40">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  <div className="p-2">
                    <h3 className="text-white text-lg font-bold">
                      {product.name}{" "}
                      <span className="text-zinc-100 bg-blue-700 rounded-[10px] px-2 text-sm">
                        {product.category}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-500 text-md line-through">
                        R$ {product.comparation?.toFixed(2).replace(".", ",") || "0,00"}
                      </p>
                      <span className="text-green-500 text-sm font-semibold">
                        {calculateDiscount(
                          product.comparation,
                          product.price
                        )}% OFF
                      </span>
                    </div>
                    <p className="text-white text-md">R$ {product.price?.toFixed(2).replace(".", ",") || "0,00"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 border-t border-slate-900 text-center">
        <p className="text-white text-sm font-normal">
          Site desenvolvido com{" "}
          <span className="text-blue-600 font-bold hover:cursor-pointer hover:underline"><span onClick={() => { Router.push("https://wizesale.com") }} className="font-bold">Wizesale</span>.</span>
        </p>
      </footer>
    </>
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

  const productsResponse = await fetch(
    `https://api.wizesale.com/v1/products`,
    {
      headers: {
        Cookie: `storeId=${storeIdData.store.id};`,
      },
    }
  );

  const categoriesResponse = await fetch(
    `https://api.wizesale.com/v1/categories`,
    {
      headers: {
        Cookie: `storeId=${storeIdData.store.id};`,
      },
    }
  );

  const storeData = await storeResponse.json();
  const productsData = await productsResponse.json();
  const categoriesData = await categoriesResponse.json();

  return {
    props: {
      products: productsData.products || [],
      categories: categoriesData.categories || [],
      store: storeData.store || null,
    },
  };
};
