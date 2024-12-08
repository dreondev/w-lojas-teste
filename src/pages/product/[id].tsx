import { FiShoppingCart, FiMenu, FiFileText, FiTrash2 } from "react-icons/fi";
import { FaHeart, FaPen, FaShoppingBasket, FaRegStar } from "react-icons/fa";
import { Heart, Star, Minus, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "react-use-cart";
import _ from "lodash";
import { GetServerSideProps } from "next";
import Router from "next/router";

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-5 h-5 ${i <= rating ? "text-yellow-400" : "text-gray-400"
          }`}
      />
    );
  }
  return stars;
}

function calculateDiscount(price: number, discount: number) {
  const discountAmount = _.subtract(price, discount);

  const discountPercentage = (_.divide(discountAmount, price) * 100).toFixed(0);

  return discountPercentage === "-Infinity" ? "0" : discountPercentage;
}

interface PageProps {
  product: any;
  store: any;
  products: any[];
}

export default function ProductById({ product, store, products }: PageProps) {
  const [favoritedProducts, setFavoritedProducts] = useState<any[]>([]);

  useEffect(() => {
    const storedFavorites = sessionStorage.getItem("favoritedProducts");
    if (storedFavorites) {
      setFavoritedProducts(JSON.parse(storedFavorites));
    }
  }, []);

  const isProductFavorited = (productId: number) => {
    return favoritedProducts.some((item) => item.id === productId);
  };

  const favoriteProductHandle = (product: any) => {
    const updatedFavorites = isProductFavorited(product.id)
      ? favoritedProducts.filter((item) => item.id !== product.id)
      : [...favoritedProducts, { id: product.id, name: product.name, image: product.images[0] }];

    setFavoritedProducts(updatedFavorites);
    sessionStorage.setItem("favoritedProducts", JSON.stringify(updatedFavorites));
  };

  const { isEmpty, items, addItem, updateItemQuantity, removeItem, cartTotal } =
    useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(true);

  if (!isClient) return null;

  return (
    <main className="h-screen flex flex-col justify-between md:mx-[100px]">
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
            className="border border-slate-900 bg-transparent text-white py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-gray-700 transition-colors"
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

      <section className="p-4 md:p-8 text-white">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-full md:w-1/2 p-4 rounded-[20px]">
            <img
              src={product.images[0]}
              alt="Produto"
              className="rounded-[20px] w-full max-h-[460px] h-full mt-[-10px]"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="p-4 border border-slate-900 rounded-[20px]">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {product.name} <br />
                  <span className="text-sm bg-blue-600 px-4 py-1 rounded-full">
                    {product.category}
                  </span>
                </h2>
                <Heart
                  onClick={() => favoriteProductHandle(product)}
                  className={`rounded-full w-6 h-6 ${isProductFavorited(product.id) ? "text-red-500" : "text-white"
                    } hover:text-red-500 cursor-pointer`}
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                {renderStars(4)}
                <span className="text-sm text-gray-400">4.0</span>
                {product.hideSales !== true && (
                  <span className="text-sm text-gray-400"> - {product.sales} Venda(s)</span>
                )}
              </div>

              <p className="text-1xl font-bold mt-4">
                <span className="line-through text-zinc-600">
                  R$ {product.comparation?.toFixed(2).replace(".", ",") || "0,00"}
                </span>{" "}
                <span className="text-2xl">
                  R$ {product.price.toFixed(2).replace(".", ",") || 0}
                </span>
              </p>

              <div className="flex items-center gap-4 mt-4 md:flex-row flex-row">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          comparation: product.comparation,
                          image: product.images[0],
                        });
                      }}
                      className="w-full md:w-auto px-6 py-2 border border-white text-white rounded-full hover:bg-gray-950"
                    >
                      Comprar Agora
                    </button>
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
            </div>

            <div className="mt-2 p-4 border border-slate-900 rounded-[20px]">
              <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                <span className="flex items-center space-x-2">
                  <FaPen className="w-4 h-4" />
                  <span>Descrição</span>
                </span>
                <button onClick={() => setDescriptionOpen(!descriptionOpen)}>
                  {descriptionOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </h3>
              <div className="flex items-center space-x-4">
                {descriptionOpen && (
                  <p className="text-gray-300">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {product.hideReviews !== true && (
          <div className="mt-8">
            <div className="mt-2 p-4 border border-slate-900 rounded-[20px]">
              <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                <span className="flex items-center space-x-2">
                  <FaRegStar className="w-4 h-4" />
                  <span>Avaliações dos Clientes</span>
                </span>
                <button onClick={() => setReviewsOpen(!reviewsOpen)}>
                  {reviewsOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </h3>
              {reviewsOpen && (
                <div>
                  {product.reviews.map((review: any, index: number) => (
                    <div
                      key={index}
                      className="mb-2 border-b border-gray-600 pb-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{review.reviewer}</span>
                        <span className="flex">{renderStars(review.rating)}</span>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Produtos Similares</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.filter((product: any) => product.category === product.category)
              .slice(0, 3)
              .map((product: any) => (
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
                    <p className="text-white text-md">R$ {product.price.toFixed(2).replace(".", ",") || 0}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <footer className="py-4 border-t border-slate-900 text-center">
        <p className="text-white text-sm font-medium">
          Site desenvolvido com{" "}
          <span className="text-blue-600 font-bold">Wizesale</span>
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

  const { id } = context.params || {};

  const storeResponse = await fetch(`https://api.wizesale.com/v1/store`, {
    headers: {
      Cookie: `storeId=${storeIdData.store.id};`,
    },
  });

  const productResponse = await fetch(
    `https://api.wizesale.com/v1/product/${id}`,
    {
      headers: {
        Cookie: `storeId=${storeIdData.store.id};`,
      },
    }
  );

  const productsResponse = await fetch(
    `https://api.wizesale.com/v1/products`,
    {
      headers: {
        Cookie: `storeId=${storeIdData.store.id};`,
      },
    }
  );

  const storeData = await storeResponse.json();
  const productData = await productResponse.json();
  const productsData = await productsResponse.json();

  console.log(productData.product)

  return {
    props: {
      products: productsData.products || [],
      product: productData.product || null,
      store: storeData.store || null,
    },
  };
};
