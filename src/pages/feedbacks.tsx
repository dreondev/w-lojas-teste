import { FiShoppingCart, FiMenu, FiStar, FiFileText, FiTrash2 } from "react-icons/fi";
import * as React from "react";
import { FaHeart, FaShoppingBasket, FaRegStar } from "react-icons/fa";
import { useCart } from "react-use-cart";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Minus, Plus } from "lucide-react";
import _ from "lodash";
import Router from "next/router";

function calculateDiscount(price: number, discount: number) {
  const discountAmount = _.subtract(price, discount);

  const discountPercentage = (_.divide(discountAmount, price) * 100).toFixed(0);

  return discountPercentage === "-Infinity" ? "0" : discountPercentage;
}

export default function Feedbacks() {
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
    <main className="md:mx-[100px] h-screen flex flex-col justify-between">
      <header className="flex justify-between items-center p-4 bg-transparent backdrop-blur-[10px] border-b border-slate-900 flex-wrap md:flex-nowrap">
        <div className="flex items-center mb-2 md:mb-0">
          <img
            src="https://cdn.discordapp.com/icons/1108882461032718378/a_8c26791038c1b0710a9ff5b25d21ebe5.gif?size=2048"
            alt="Logo"
            className="h-10 mr-4 rounded-[10px]"
          />
          <span className="font-medium text-[17px] text-white">
            Brancola Store
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
            className="bg-transparent text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 hover:bg-gray-700 transition-colors"
          >
            <FiFileText className="w-4 h-4 mr-1" />
            <span>Termos</span>
          </a>
          <a
            href="/feedbacks"
            className="bg-blue-700 hover:bg-blue-600 font-normal text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 transition-colors"
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
        <h1 className="text-2xl font-bold mb-4">Feedbacks</h1>
        <p className="mb-4">
          Veja os feedbacks enviados pelos nossos clientes.
        </p>

        <hr className="mb-6 border-slate-900" />

        <div className=" p-4 mb-2 rounded-lg">
          <div className="flex items-center mb-4">
            <img
              src="https://via.placeholder.com/50"
              alt="Usuário"
              className="h-10 w-10 rounded-full mr-4"
            />
            <div>
              <span className="block text-white font-medium text-[16px]">João Silva</span>
              <div className="flex items-center">
                {[...Array(4)].map((_, i) => (
                  <FiStar key={i} className="text-white" />
                ))}
                {[...Array(1)].map((_, i) => (
                  <FiStar key={i} className="text-gray-500" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Excelente loja! Produtos de alta qualidade e entrega super rápida. Recomendo a todos!
          </p>
        </div>

        <div className=" p-4 mb-2 rounded-lg">
          <div className="flex items-center mb-4">
            <img
              src="https://via.placeholder.com/50"
              alt="Usuário"
              className="h-10 w-10 rounded-full mr-4"
            />
            <div>
              <span className="block text-white font-medium text-[16px]">Maria Oliveira</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="text-white" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Atendimento ótimo, sempre me ajudam com todas as dúvidas e os produtos são incríveis.
          </p>
        </div>

        <div className=" p-4 mb-2 rounded-lg">
          <div className="flex items-center mb-4">
            <img
              src="https://via.placeholder.com/50"
              alt="Usuário"
              className="h-10 w-10 rounded-full mr-4"
            />
            <div>
              <span className="block text-white font-medium text-[16px]">Carlos Pereira</span>
              <div className="flex items-center">
                {[...Array(3)].map((_, i) => (
                  <FiStar key={i} className="text-white" />
                ))}
                {[...Array(2)].map((_, i) => (
                  <FiStar key={i} className="text-gray-500" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Gostei da experiência, mas acredito que poderiam melhorar o prazo de entrega.
          </p>
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
