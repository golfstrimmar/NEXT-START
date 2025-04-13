"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import Shevron from "@/assets/svg/chevron-down.svg";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  PopoverGroup,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/providers/CartContext";
import { useRouter, usePathname } from "next/navigation";

const pages = [
  { name: "Shop", href: "/shop" },
  { name: "Company", href: "#" },
  { name: "Stores", href: "#" },
  { name: "Admin", href: "/admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [activeLink, setactiveLink] = useState<string>("");
  const [categories, setCategories] = useState<
    { category: string; subcategories?: string[] }[]
  >([]);
  const [openTabs, setOpenTabs] = useState<{ [key: string]: boolean }>({});
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pathname) {
      setactiveLink(pathname);
    }
  }, [pathname]);

  const handleCartClick = () => {
    if (status === "authenticated") {
      router.push("/cart");
    } else {
      setError("User not authenticated");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  const memoizedCategories = useMemo(() => categories, [categories]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    fetchData();
  }, []);

  const toggleTab = (category: string) => {
    setOpenTabs((prev) => {
      const resetTabs = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as { [key: string]: boolean });

      return {
        ...resetTabs,
        [category]: !prev[category],
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideAnyTab = Object.values(tabRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );

      if (
        !isClickInsideAnyTab &&
        Object.values(openTabs).some((isOpen) => isOpen)
      ) {
        setOpenTabs((prev) =>
          Object.keys(prev).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {} as { [key: string]: boolean }
          )
        );
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTabs]);

  // Обработка поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?name=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <div>
      {error && <ModalMessage message={error} open={showModal} />}
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <a
                    href={page.href}
                    className="-m-2 block p-2 font-medium text-gray-900"
                  >
                    {page.name}
                  </a>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                  className="block h-auto w-5 shrink-0"
                />
                <span className="ml-3 block text-base font-medium text-gray-900">
                  CAD
                </span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white z-[100]">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>
        <nav aria-label="Top" className="mx-auto max-w-[1600px] px-4">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 lg:hidden cursor-pointer transition-all duration-300 ease-in-out"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="size-6 text-gray-400 hover:text-gray-900"
                />
              </button>

              <div className="ml-4 flex lg:ml-0">
                <Link href={`/`} onClick={() => setOpen(false)}>
                  <Image
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    width={40}
                    height={40}
                    alt="tailwindcss"
                  />
                </Link>
              </div>

              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-4 items-center">
                  {memoizedCategories &&
                    memoizedCategories.map((category) => {
                      const categorySlug = category.category;
                      const subCategories = category.subcategories;

                      return (
                        <div
                          key={category.category}
                          className="w-full relative min-w-[100px]"
                          ref={(el) =>
                            (tabRefs.current[category.category] = el)
                          }
                        >
                          <div className="tab border border-gray-200 rounded-md bg-white overflow-hidden">
                            <div
                              className="tab-header flex items-center justify-between p-1 cursor-pointer hover:bg-gray-300 transition-colors text-sm text-gray-700 hover:text-indigo-500 duration-200 ease-in-out group"
                              onClick={() => {
                                toggleTab(category.category);
                              }}
                            >
                              {category.category.charAt(0).toUpperCase() +
                                category.category.slice(1)}
                              <Shevron
                                className={`w-4 h-4 ml-2 text-gray-700 group-hover:text-indigo-500 transition-transform transition-colors duration-200 ease-in-out ${
                                  openTabs[category.category]
                                    ? "rotate-180"
                                    : "rotate-0"
                                }`}
                              />
                            </div>
                            <div
                              className={`transition-all duration-200 ease-in-out bg-white absolute grid w-full ${
                                openTabs[category.category]
                                  ? "grid-rows-[1fr] border-gray-200 border rounded-md"
                                  : "grid-rows-[0fr] border-transparent"
                              } overflow-hidden`}
                            >
                              <div className="min-h-0">
                                <Link
                                  href={`/shop/${categorySlug}`}
                                  className={`block text-sm text-gray-700 px-2 pt-2 pb-2 hover:text-indigo-500 transition duration-300 ease-in-out ${
                                    activeLink === `/shop/${categorySlug}`
                                      ? "border-l-4 border-indigo-600 text-indigo-600 font-medium"
                                      : "text-gray-700 border-l-4 border-transparent"
                                  }`}
                                >
                                  {category.category.charAt(0).toUpperCase() +
                                    category.category.slice(1)}
                                </Link>
                                <div className="py-2 border-t-1">
                                  {subCategories &&
                                    subCategories.map((foo) => (
                                      <Link
                                        key={foo}
                                        href={`/shop/${categorySlug}/${foo}`}
                                        className={`block px-2 text-sm text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out ${
                                          activeLink ===
                                          `/shop/${categorySlug}/${foo}`
                                            ? "border-l-4 border-indigo-600 text-indigo-600 font-medium"
                                            : "text-gray-700 border-l-4 border-transparent"
                                        }`}
                                      >
                                        {foo.charAt(0).toUpperCase() +
                                          foo.slice(1)}
                                      </Link>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {pages.map((page: { name: string; href: string }) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className={`flex items-center text-sm border-bottom border-indigo-600 text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out ${
                        activeLink.startsWith(page.href)
                          ? "border-b-2 border-indigo-600 text-indigo-600"
                          : "text-gray-700 font-medium"
                      }`}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center h-[100%]">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6 h-[100%]">
                  {session ? (
                    <>
                      {session.user?.image && (
                        <Link href="/profile">
                          <img
                            className="rounded-full mr-2 w-10 h-10 cursor-pointer"
                            src={session.user?.image}
                            alt={session.user?.name || "User avatar"}
                          />
                        </Link>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Hallo, {session.user?.name}
                      </span>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-sm font-medium text-gray-700 hover:text-indigo-500 cursor-pointer"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className={`flex items-center text-sm h-[100%] text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out 
                            ${
                              "/auth/signin" === activeLink
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-700 font-medium"
                            }`}
                      >
                        Sign in
                      </Link>
                      <span
                        aria-hidden="true"
                        className="h-6 w-px bg-gray-200"
                      />
                      <Link
                        href="/auth/signup"
                        className={`flex items-center text-sm h-[100%] text-gray-700 hover:text-indigo-500 transition duration-300 ease-in-out 
                            ${
                              "/auth/signup" === activeLink
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-700 font-medium"
                            }`}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>

                <div className="hidden lg:ml-8 lg:flex">
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-indigo-500"
                  >
                    <img
                      alt=""
                      src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                      className="block h-auto w-5 shrink-0"
                    />
                    <span className="ml-3 block text-sm font-medium">USD</span>
                    <span className="sr-only">, change currency</span>
                  </a>
                </div>

                {/* Search */}
                <div className="flex lg:ml-6 relative">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon
                      aria-hidden="true"
                      className="size-6  cursor-pointer"
                    />
                  </button>
                  {isSearchOpen && (
                    <form
                      onSubmit={handleSearchSubmit}
                      className="absolute top-12 right-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    >
                      <div className="flex items-center p-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name..."
                          className="w-full px-3 py-2 text-sm text-gray-700 border-none focus:outline-none focus:ring-0"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-indigo-500"
                        >
                          <MagnifyingGlassIcon
                            aria-hidden="true"
                            className="size-5 cursor-pointer"
                          />
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <div
                    onClick={handleCartClick}
                    className={`group -m-2 flex items-center p-2 cursor-pointer relative ${
                      "/cart" === activeLink
                        ? "text-indigo-800 font-bold text-lg"
                        : "text-gray-700 font-medium"
                    }`}
                  >
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className={`size-6 shrink-0 text-gray-400 group-hover:text-gray-500 ${
                        "/cart" === activeLink
                          ? "text-indigo-900"
                          : "text-gray-400"
                      }`}
                    />
                    <p className="ml-2 text-[12px] font-light text-gray-100 group-hover:text-gray-300 absolute right-0 top-2 bg-[#e11d48] rounded-full w-4.5 h-4.5 flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out">
                      <span>{totalItems}</span>
                    </p>
                    <span className="sr-only">items in cart, view bag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
