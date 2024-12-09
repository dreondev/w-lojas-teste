import { FiShoppingCart, FiMenu, FiFileText, FiTrash2 } from "react-icons/fi";
import * as React from "react";
import {
  FaArrowRight,
  FaHeart,
  FaShoppingBasket,
  FaRegStar,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useCart } from "react-use-cart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseCookies, setCookie } from "nookies"
import Router from "next/router";
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
import { GetServerSideProps } from "next";

function calculateDiscount(price: number, discount: number) {
  const discountAmount = _.subtract(price, discount);

  const discountPercentage = (_.divide(discountAmount, price) * 100).toFixed(0);

  return discountPercentage === "-Infinity" ? "0" : discountPercentage;
}

interface PageProps {
  store: any;
}

export default function Checkout({ store }: PageProps) {
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

  const { isEmpty, items, cartTotal, updateItemQuantity, removeItem } = useCart();

  const [isClient, setIsClient] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [coupon, setCouponCode] = React.useState("");
  const [discounted, setCouponDiscounted] = React.useState(0);
  const [totalToPay, setTotalToPay] = React.useState(cartTotal);

  const [emailToSend, setEmailToSend] = React.useState("");

  const [selectedPayment, setSelectedPayment] = React.useState(null);
  const [selectedDelivery, setSelectedDelivery] = React.useState(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const [disabledWhenRequesting, setDisabledWhenRequesting] = React.useState(false);

  const handleSelectPayment = (method: any) => {
    setSelectedPayment(method);
  };

  const handleSelectDelivery = (method: any) => {
    setSelectedDelivery(method);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const proceedToPayment = async () => {
    setDisabledWhenRequesting(true)

    try {
      if (!selectedPayment) {
        toast.error("Por favor, selecione uma metodo de pagamento.");
        setDisabledWhenRequesting(false)
        return;
      }

      if (!termsAccepted) {
        toast.error("Por favor, aceite os termos para continuar.");
        setDisabledWhenRequesting(false)
        return;
      }

      if (!emailToSend || !validateEmail(emailToSend)) {
        toast.error("Por favor, forneça um e-mail válido.");
        setDisabledWhenRequesting(false)
        return;
      }

      const cookies = parseCookies();

      const invoiceResponse = await fetch(`https://api.wizesale.com/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: totalToPay,
          paymentMethod: selectedPayment,
          storeId: Number(cookies.storeId),
          email: emailToSend,
          items
        }),
      })

      const invoiceData = await invoiceResponse.json();

      if (invoiceResponse.ok) {
        const { checkoutUrl, qrCode, qrCodeBase64 } = invoiceData

        if (checkoutUrl !== null) {
          Router.push(checkoutUrl)
        }
      }

      if (!invoiceResponse.ok) {
        toast.error(invoiceData.error);
        setDisabledWhenRequesting(false)
        return;
      }

      setDisabledWhenRequesting(false)
    } catch (err) {
      toast.error("Erro desconhecido")
      setDisabledWhenRequesting(false)
    }

  }

  const setCouponHandle = async () => {
    const cookies = parseCookies();

    try {
      const couponResponse = await fetch(`https://api.wizesale.com/v1/coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: coupon,
          storeId: Number(cookies.storeId),
        }),
      })

      const couponData = await couponResponse.json();

      if (!couponResponse.ok) {
        toast.error(couponData.error);
        return;
      }

      if (couponResponse.ok) {
        const { maxUses, uses, minPrice, expiresAt, discount } = couponData.coupon;

        if (maxUses !== null && uses >= maxUses) {
          toast.error("O cupom atingiu o limite de usos.");
          return;
        }

        if (expiresAt && new Date(expiresAt) < new Date()) {
          toast.error("O cupom expirou.");
          return;
        }

        if (minPrice !== null && cartTotal < minPrice) {
          toast.error(`O valor mínimo para usar o cupom é R$ ${minPrice.toFixed(2).replace('.', ',')}`);
          return;
        }

        const discountAfterCoupon = (cartTotal * discount) / 100;
        const totalAfterDiscount = cartTotal - discountAfterCoupon;
        console.log(discountAfterCoupon)
        console.log(totalAfterDiscount)

        setCouponDiscounted(discountAfterCoupon)
        setTotalToPay(totalAfterDiscount)
        toast.success("Cupom utilizado com sucesso")
      }
    } catch (err) {
      toast.error("Erro desconhecido")
    }

  };

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
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (isEmpty) {
    Router.push("/")
  }

  return (
    <>
    {store?.announCard?.activated && (
      <div className="z-10 bg-blue-600 text-white text-center py-2 font-semibold text-sm w-full">
        {store.announCard.text}
      </div>
    )}
    <main className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-40 3xl:mx-64 flex flex-col min-h-screen">

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        theme="dark"
      />
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
            className="bg-transparent hover:bg-gray-700 font-normal text-white border border-slate-900 py-1 px-4 rounded-[14px] flex items-center space-x-1 transition-colors"
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-[#080d14de] p-6 rounded-lg border border-slate-900">
            <h2 className="text-xl font-semibold mb-4">Checkout</h2>
            <div className="space-y-4">
              <div className="p-4 bg-[#080d14de] rounded-lg border border-slate-900">
                <h3 className="font-medium mb-2">Método de Pagamento</h3>
                <p className="text-gray-400 mb-2">
                  Escolha seu método de pagamento.
                </p>
                <div
                  className={`mt-2 p-4 rounded-lg flex justify-between items-center border border-slate-900 cursor-pointer ${selectedPayment === "mercadopago"
                    ? "bg-[#0e1724] border-slate-900"
                    : "bg-[#050e16] border-slate-900"
                    }`}
                  onClick={() => handleSelectPayment("mercadopago")}
                >
                  <img
                    src="assets/MP.png"
                    alt="Produto 2"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex flex-col flex-1 ml-4">
                    <span>Mercado Pago</span>
                    <span className="text-sm text-gray-400">
                      Aprovação Imediata
                    </span>
                  </div>
                </div>
                <div
                  className={`mt-2 p-4 rounded-lg flex justify-between items-center border border-slate-900 cursor-pointer ${selectedPayment === "asaas"
                    ? "bg-[#0e1724] border-slate-900"
                    : "bg-[#050e16] border-slate-900"
                    }`}
                  onClick={() => handleSelectPayment("asaas")}
                >
                  <img
                    src="assets/ASAAS.png"
                    alt="Produto 2"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex flex-col flex-1 ml-4">
                    <span>Asaas</span>
                    <span className="text-sm text-gray-400">
                      Aprovação Imediata
                    </span>
                  </div>
                </div>
                <div
                  className={`mt-2 p-4 rounded-lg flex justify-between items-center border border-slate-900 cursor-pointer ${selectedPayment === "paypal"
                    ? "bg-[#0e1724] border-slate-900"
                    : "bg-[#050e16] border-slate-900"
                    }`}
                  onClick={() => handleSelectPayment("paypal")}
                >
                  <img
                    src="assets/PAYPAL.png"
                    alt="Produto 2"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex flex-col flex-1 ml-4">
                    <span>PayPal</span>
                    <span className="text-sm text-gray-400">
                      Aprovação Imediata
                    </span>
                  </div>
                </div>
                <div
                  className={`mt-2 p-4 rounded-lg flex justify-between items-center border border-slate-900 cursor-pointer ${selectedPayment === "stripe"
                    ? "bg-[#0e1724] border-slate-900"
                    : "bg-[#050e16] border-slate-900"
                    }`}
                  onClick={() => handleSelectPayment("stripe")}
                >
                  <img
                    src="assets/STRIPE.webp"
                    alt="Produto 2"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex flex-col flex-1 ml-4">
                    <span>Stripe</span>
                    <span className="text-sm text-gray-400">
                      Aprovação Imediata
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#080d14de] rounded-lg border border-slate-900">
                <h3 className="font-medium mb-2">Suas Informações</h3>
                <p className="text-gray-400 mb-2">
                  Informe seu e-mail em que o produto será entregue
                </p>
                <div
                  className={`p-4 rounded-lg flex justify-between items-center border border-slate-900 ${selectedDelivery === "email"
                    ? "bg-[#050e16] border-none"
                    : "bg-[#050e16] border-none"
                    }`}
                  onClick={() => handleSelectDelivery("email")}
                >
                  <div className="flex items-center flex-1 ml-">
                    <div className="relative flex items-center justify-start w-full overflow-hidden">
                      <div className="absolute px-3 flex items-center bg-accent h-full rounded-md rounded-r-none">
                        <MdEmail />
                      </div>
                      <input value={emailToSend} onChange={(e) => { setEmailToSend(e.target.value) }} className="flex pl-10 px-3 py-2 hover:outline-blue-600 focus:outline-none w-full bg-transparent text-white font-semibold rounded-lg border border-slate-900 transition-colors" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1  p-6 rounded-lg border border-slate-900">
            <h2 className="text-xl font-semibold mb-4">Seu(s) Produto(s)</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div className="p-4 bg-slate-800 rounded-lg flex justify-between items-center border border-slate-900">
                  <img
                    src={item.image}
                    alt="Produto 1"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex flex-col flex-1 ml-4">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-400">{item.quantity}x R${item.price?.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <span>R${item.price?.toFixed(2).replace(".", ",")}</span>
                </div>
              ))}

            </div>

            <div className="mt-6 p-4  rounded-lg border border-slate-900">
              <div className="flex justify-between mb-2">
                <span>Informe um cupom de desconto:</span>
              </div>
              <div className="flex space-x-2">
                <input
                  value={coupon}
                  onChange={(e) => { setCouponCode(e.target.value) }}
                  type="text"
                  className="px-2 hover:outline-blue-600 focus:outline-none w-full py-1 mt-2 bg-transparent text-white font-semibold rounded-lg border border-slate-900 transition-colors"
                />
                <button onClick={setCouponHandle} className="w-[100px] py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Aplicar
                </button>
              </div>

            </div>

            <div className="mt-6 p-4  rounded-lg border border-slate-900">
              <div className="flex justify-between mb-2">
                <span>Desconto:</span>
                <span>R${discounted?.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span>R${cartTotal?.toFixed(2).replace(".", ",")}</span>
              </div>
              <hr className="border-slate-900 mb-1" />
              <div className="flex justify-between mb-2">
                <span>Á pagar:</span>
                <span>R${totalToPay?.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="mt-4">
                <label className="flex items-center justify-center text-sm text-gray-400">
                  <input
                    type="checkbox"
                    className="flex mr-2"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  Aceito e concordo com todos os{" "}
                  <span className="text-blue-600 ml-1 mr-1 hover:underline hover:cursor-pointer">
                    Termos de Uso
                  </span>{" "}
                  da Loja
                </label>
              </div>
              {!disabledWhenRequesting ? (
                <button disabled={!emailToSend || !termsAccepted || !selectedPayment} onClick={proceedToPayment} className="disabled:cursor-not-allowed disabled:bg-blue-600/50 w-full py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Continuar para Pagamento
                </button>
              ) : (
                <button
                  disabled
                  type="button"
                  className="disabled:cursor-not-allowed disabled:bg-blue-600/50 w-full py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 me-3 text-white animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                  Criando Pagamento
                </button>
              )}

              <a href="/" className="flex items-center justify-center mt-2">
                <span>
                  Ou{" "}
                  <span className="underline text-blue-600">
                    continue comprando
                  </span>
                </span>
                <FaArrowRight className="w-4 h-4 ml-1 text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-4 border-t border-slate-900 text-center">
        <p className="text-white text-sm font-normal">
          Site desenvolvido com{" "}
          <span className="text-blue-600 font-bold hover:cursor-pointer hover:underline"><span onClick={() => { Router.push("https://wizesale.com") }} className="font-bold">Wizesale</span>.</span>
        </p>
      </footer>
    </main>
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

  const storeData = await storeResponse.json();

  return {
    props: {
      store: storeData.store || null,
    },
  };
};