import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
};

type CartItem = Product & {
  qty: number;
};

type Order = {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};

type Page = "Home" | "Menu" | "History" | "Settings";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: 35.5,
    category: "Burger",
    emoji: "🍔",
  },
  {
    id: 2,
    name: "Cheese Burger",
    price: 39.99,
    category: "Burger",
    emoji: "🍔",
  },
  {
    id: 3,
    name: "Double Burger",
    price: 44.64,
    category: "Burger",
    emoji: "🍔",
  },
  {
    id: 4,
    name: "Chicken Burger",
    price: 42,
    category: "Burger",
    emoji: "🍔",
  },
  {
    id: 5,
    name: "Pepperoni Pizza",
    price: 48.5,
    category: "Pizza",
    emoji: "🍕",
  },
  {
    id: 6,
    name: "Chicken Pizza",
    price: 52,
    category: "Pizza",
    emoji: "🍕",
  },
  {
    id: 7,
    name: "Veggie Pizza",
    price: 45,
    category: "Pizza",
    emoji: "🍕",
  },
  {
    id: 8,
    name: "Fried Chicken",
    price: 29.99,
    category: "Chicken",
    emoji: "🍗",
  },
  {
    id: 9,
    name: "Chicken Wings",
    price: 27.5,
    category: "Chicken",
    emoji: "🍗",
  },
  {
    id: 10,
    name: "French Fries",
    price: 15,
    category: "Sides",
    emoji: "🍟",
  },
  {
    id: 11,
    name: "Onion Rings",
    price: 17,
    category: "Sides",
    emoji: "🧅",
  },
  {
    id: 12,
    name: "Cola",
    price: 8.5,
    category: "Drinks",
    emoji: "🥤",
  },
  {
    id: 13,
    name: "Fresh Juice",
    price: 12,
    category: "Drinks",
    emoji: "🧃",
  },
];

const CATEGORIES = [
  "All",
  "Burger",
  "Pizza",
  "Chicken",
  "Sides",
  "Drinks",
];

const DARK = {
  bg: "#0f1015",
  panel: "#171821",
  panel2: "#1d1e28",
  card: "#191a23",
  input: "#20212b",
  text: "#ffffff",
  muted: "#9295a5",
  border: "#292b36",
  red: "#fa5759",
  redDark: "#d94346",
  green: "#35c98a",
  blue: "#4d9cff",
  yellow: "#ffbd4a",
};

const LIGHT = {
  bg: "#f5f6fa",
  panel: "#ffffff",
  panel2: "#f0f1f5",
  card: "#ffffff",
  input: "#eceef3",
  text: "#151620",
  muted: "#707481",
  border: "#dfe1e8",
  red: "#ef4f52",
  redDark: "#d83e42",
  green: "#20ad70",
  blue: "#397fe6",
  yellow: "#e3a12e",
};

const money = (value: number) => `$${value.toFixed(2)}`;

export default function POSFood() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;
  const isDesktop = width >= 1000;

  const [page, setPage] = useState<Page>("Home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  const colors = darkMode ? DARK : LIGHT;

  const drawerX = useRef(
    new Animated.Value(-Math.max(width, Dimensions.get("window").width))
  ).current;

  const addAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!drawerOpen) {
      drawerX.setValue(-width);
    }
  }, [width, drawerOpen, drawerX]);

  const openDrawer = () => {
    setDrawerOpen(true);

    drawerX.setValue(-width);

    Animated.spring(drawerX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 150,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerX, {
      toValue: -width,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setDrawerOpen(false);
    });
  };

  const addToCart = (product: Product) => {
    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    addAnimation.setValue(0.9);

    Animated.spring(addAnimation, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 180,
    }).start();
  };

  const increaseQty = (id: number) => {
    setCart((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (id: number) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const changePage = (nextPage: Page) => {
    setPage(nextPage);

    if (nextPage !== "Menu") {
      setSearch("");
    }

    if (drawerOpen) {
      closeDrawer();
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }, [cart]);

  const tax = subtotal * 0.1;

  const total = subtotal + tax;

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const categoryMatch =
        category === "All" ||
        product.category === category;

      const searchMatch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const completeOrder = () => {
    if (cart.length === 0) {
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString(),
      items: cart.map((item) => ({
        ...item,
      })),
      subtotal,
      tax,
      total,
    };

    setOrders((previous) => [
      newOrder,
      ...previous,
    ]);

    setCart([]);

    if (drawerOpen) {
      closeDrawer();
    }

    setPage("History");
  };

  const columns = isMobile
    ? 2
    : isTablet
    ? 3
    : 4;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View
        style={[
          styles.app,
          {
            backgroundColor: colors.bg,
          },
        ]}
      >
        {/* DESKTOP SIDEBAR */}
        {isDesktop && (
          <Sidebar
            page={page}
            onPageChange={changePage}
            colors={colors}
          />
        )}

        {/* MAIN */}
        <View style={styles.main}>
          {/* HEADER */}
          <Header
            page={page}
            cartCount={cartCount}
            onMenuPress={openDrawer}
            onCartPress={openDrawer}
            colors={colors}
            isDesktop={isDesktop}
          />

          {/* CONTENT */}
          <View style={styles.content}>
            {page === "Home" && (
              <Dashboard
                colors={colors}
                cart={cart}
                cartCount={cartCount}
                total={total}
                orders={orders}
                onMenu={() => changePage("Menu")}
              />
            )}

            {page === "Menu" && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.menuScroll,
                  {
                    paddingBottom: isMobile ? 120 : 30,
                  },
                ]}
              >
                {/* MENU TOP */}
                <View style={styles.menuTop}>
                  <View>
                    <Text
                      style={[
                        styles.pageTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      Menu
                    </Text>

                    <Text
                      style={[
                        styles.pageSubtitle,
                        {
                          color: colors.muted,
                        },
                      ]}
                    >
                      Choose your favorite food
                    </Text>
                  </View>

                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: addAnimation,
                        },
                      ],
                    }}
                  >
                    <Pressable
                      onPress={openDrawer}
                      style={[
                        styles.orderMiniButton,
                        {
                          backgroundColor: colors.red,
                        },
                      ]}
                    >
                      <Text style={styles.orderMiniIcon}>
                        🛒
                      </Text>

                      <Text style={styles.orderMiniText}>
                        {cartCount}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>

                {/* SEARCH */}
                <View
                  style={[
                    styles.searchBox,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.searchIcon}>
                    🔎
                  </Text>

                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search food..."
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.searchInput,
                      {
                        color: colors.text,
                      },
                    ]}
                  />

                  {search.length > 0 && (
                    <Pressable
                      onPress={() => setSearch("")}
                    >
                      <Text
                        style={[
                          styles.clearSearch,
                          {
                            color: colors.muted,
                          },
                        ]}
                      >
                        ✕
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* CATEGORIES */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categories}
                >
                  {CATEGORIES.map((item) => {
                    const active =
                      category === item;

                    return (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setCategory(item)
                        }
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor: active
                              ? colors.red
                              : colors.panel,
                            borderColor: active
                              ? colors.red
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            {
                              color: active
                                ? "#fff"
                                : colors.muted,
                            },
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* PRODUCTS */}
                <View
                  style={[
                    styles.productGrid,
                    {
                      gap: isMobile ? 10 : 14,
                    },
                  ]}
                >
                  {filteredProducts.map(
                    (product, index) => (
                      <View
                        key={`${product.id}-${columns}`}
                        style={{
                          width:
                            columns === 2
                              ? "48.2%"
                              : columns === 3
                              ? "31.8%"
                              : "23.6%",
                        }}
                      >
                        <ProductCard
                          product={product}
                          index={index}
                          onAdd={addToCart}
                          colors={colors}
                          isMobile={isMobile}
                        />
                      </View>
                    )
                  )}
                </View>

                {filteredProducts.length === 0 && (
                  <View style={styles.noProducts}>
                    <Text
                      style={[
                        styles.noProductsIcon,
                      ]}
                    >
                      🍽️
                    </Text>

                    <Text
                      style={[
                        styles.noProductsTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      No food found
                    </Text>

                    <Text
                      style={[
                        styles.noProductsText,
                        {
                          color: colors.muted,
                        },
                      ]}
                    >
                      Try another search or category.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {page === "History" && (
              <History
                colors={colors}
                orders={orders}
              />
            )}

            {page === "Settings" && (
              <Settings
                colors={colors}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            )}
          </View>
        </View>

        {/* DESKTOP RIGHT ORDER */}
        {isDesktop && (
          <OrderPanel
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            clearCart={clearCart}
            completeOrder={completeOrder}
            colors={colors}
          />
        )}

        {/* MOBILE/TABLET DRAWER */}
        {drawerOpen && !isDesktop && (
          <Pressable
            onPress={closeDrawer}
            style={styles.overlay}
          />
        )}

        {!isDesktop && drawerOpen && (
          <Animated.View
            style={[
              styles.drawer,
              {
                width: isMobile
                  ? Math.min(width * 0.88, 390)
                  : Math.min(width * 0.55, 450),
                backgroundColor: colors.panel,
                transform: [
                  {
                    translateX: drawerX,
                  },
                ],
              },
            ]}
          >
            <DrawerContent
              page={page}
              cart={cart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onPageChange={changePage}
              onClose={closeDrawer}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              clearCart={clearCart}
              completeOrder={completeOrder}
              colors={colors}
            />
          </Animated.View>
        )}

        {/* MOBILE FLOATING ORDER */}
        {!isDesktop && !drawerOpen && (
          <Pressable
            onPress={openDrawer}
            style={[
              styles.floatingOrder,
              {
                backgroundColor: colors.red,
              },
            ]}
          >
            <Text style={styles.floatingIcon}>
              🛒
            </Text>

            {cartCount > 0 && (
              <View style={styles.floatingBadge}>
                <Text style={styles.floatingBadgeText}>
                  {cartCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  onPageChange,
  colors,
}: {
  page: Page;
  onPageChange: (page: Page) => void;
  colors: typeof DARK;
}) {
  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.panel,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View style={styles.logoBox}>
        <View
          style={[
            styles.logoIcon,
            {
              backgroundColor: colors.red,
            },
          ]}
        >
          <Text style={styles.logoEmoji}>
            🍔
          </Text>
        </View>

        <Text
          style={[
            styles.logoText,
            {
              color: colors.text,
            },
          ]}
        >
          POSFood
        </Text>
      </View>

      <View style={styles.sidebarMenu}>
        <SidebarButton
          icon="⌂"
          title="Home"
          active={page === "Home"}
          onPress={() => onPageChange("Home")}
          colors={colors}
        />

        <SidebarButton
          icon="▦"
          title="Menu"
          active={page === "Menu"}
          onPress={() => onPageChange("Menu")}
          colors={colors}
        />

        <SidebarButton
          icon="◷"
          title="History"
          active={page === "History"}
          onPress={() => onPageChange("History")}
          colors={colors}
        />

        <SidebarButton
          icon="⚙"
          title="Settings"
          active={page === "Settings"}
          onPress={() => onPageChange("Settings")}
          colors={colors}
        />
      </View>

      <View style={styles.sidebarBottom}>
        <Text
          style={[
            styles.versionText,
            {
              color: colors.muted,
            },
          ]}
        >
          POSFood
        </Text>

        <Text
          style={[
            styles.versionText,
            {
              color: colors.muted,
            },
          ]}
        >
          v1.0
        </Text>
      </View>
    </View>
  );
}

function SidebarButton({
  icon,
  title,
  active,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  active: boolean;
  onPress: () => void;
  colors: typeof DARK;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sidebarButton,
        {
          backgroundColor: active
            ? colors.red
            : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.sidebarIcon,
          {
            color: active
              ? "#fff"
              : colors.muted,
          },
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.sidebarText,
          {
            color: active
              ? "#fff"
              : colors.muted,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  
  page,
  cartCount,
  onMenuPress,
  onCartPress,
  colors,
  isDesktop,
}: {
  page: Page;
  cartCount: number;
  onMenuPress: () => void;
  onCartPress: () => void;
  colors: typeof DARK;
  isDesktop: boolean;
}) {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.panel,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        {!isDesktop && (
          <Pressable
            onPress={onMenuPress}
            style={[
              styles.headerButton,
              {
                backgroundColor: colors.input,
              },
            ]}
          >
            <Text style={styles.headerButtonText}>
              ☰
            </Text>
          </Pressable>
        )}

        <View>
          <Text
            style={[
              styles.restaurantName,
              {
                color: colors.text,
              },
            ]}
          >
            Pakecho Restaurant
          </Text>

          <Text
            style={[
              styles.dateText,
              {
                color: colors.muted,
              },
            ]}
          >
            August 12, 2022
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.status}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: colors.green,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: colors.muted,
              },
            ]}
          >
            Open
          </Text>
        </View>

     
      </View>
    </View>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index,
  onAdd,
  colors,
  isMobile,
}: {
  product: Product;
  index: number;
  onAdd: (product: Product) => void;
  colors: typeof DARK;
  isMobile: boolean;
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale,
          },
        ],
      }}
    >
      <Pressable
        onPress={() => onAdd(product)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.productCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.productImage,
            {
              backgroundColor: colors.input,
              height: isMobile ? 95 : 135,
            },
          ]}
        >
          <Text
            style={[
              styles.productEmoji,
              {
                fontSize: isMobile ? 42 : 58,
              },
            ]}
          >
            {product.emoji}
          </Text>

          <View
            style={[
              styles.productNumber,
              {
                backgroundColor: colors.panel2,
              },
            ]}
          >
            <Text
              style={[
                styles.productNumberText,
                {
                  color: colors.muted,
                },
              ]}
            >
              #{String(index + 1).padStart(2, "0")}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.productName,
              {
                color: colors.text,
                fontSize: isMobile ? 14 : 16,
              },
            ]}
          >
            {product.name}
          </Text>

          <Text
            style={[
              styles.productCategory,
              {
                color: colors.muted,
              },
            ]}
          >
            {product.category}
          </Text>

          <View style={styles.productBottom}>
            <Text
              style={[
                styles.productPrice,
                {
                  color: colors.red,
                  fontSize: isMobile ? 15 : 17,
                },
              ]}
            >
              {money(product.price)}
            </Text>

            <View
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.red,
                },
              ]}
            >
              <Text style={styles.addButtonText}>
                +
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* =========================================================
   DRAWER
========================================================= */

function DrawerContent({
  page,
  cart,
  subtotal,
  tax,
  total,
  darkMode,
  setDarkMode,
  onPageChange,
  onClose,
  increaseQty,
  decreaseQty,
  clearCart,
  completeOrder,
  colors,
}: {
  page: Page;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onPageChange: (page: Page) => void;
  onClose: () => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  completeOrder: () => void;
  colors: typeof DARK;
}) {
  return (
    <View style={styles.drawerInner}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.drawerScroll}
      >
        {/* DRAWER HEADER */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerBrand}>
            <View
              style={[
                styles.drawerLogo,
                {
                  backgroundColor: colors.red,
                },
              ]}
            >
              <Text style={styles.drawerLogoText}>
                🍔
              </Text>
            </View>

            <View>
              <Text
                style={[
                  styles.drawerBrandName,
                  {
                    color: colors.text,
                  },
                ]}
              >
                POSFood
              </Text>

              <Text
                style={[
                  styles.drawerBrandSub,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Pakecho Restaurant
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.input,
              },
            ]}
          >
            <Text
              style={[
                styles.closeButtonText,
                {
                  color: colors.text,
                },
              ]}
            >
              ✕
            </Text>
          </Pressable>
        </View>

        {/* NAVIGATION */}
        <View style={styles.drawerNavigation}>
          <Text
            style={[
              styles.drawerSectionTitle,
              {
                color: colors.muted,
              },
            ]}
          >
            NAVIGATION
          </Text>

          <DrawerButton
            icon="⌂"
            title="Home"
            active={page === "Home"}
            onPress={() => onPageChange("Home")}
            colors={colors}
          />

          <DrawerButton
            icon="▦"
            title="Menu"
            active={page === "Menu"}
            onPress={() => onPageChange("Menu")}
            colors={colors}
          />

          <DrawerButton
            icon="◷"
            title="History"
            active={page === "History"}
            onPress={() => onPageChange("History")}
            colors={colors}
          />

          <DrawerButton
            icon="⚙"
            title="Settings"
            active={page === "Settings"}
            onPress={() => onPageChange("Settings")}
            colors={colors}
          />
        </View>

        {/* CURRENT ORDER */}
        <View
          style={[
            styles.drawerOrder,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.drawerOrderHeader}>
            <View>
              <Text
                style={[
                  styles.drawerOrderTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Current Order
              </Text>

              <Text
                style={[
                  styles.drawerOrderSub,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {cart.length === 0
                  ? "No items added"
                  : `${cart.length} item${
                      cart.length > 1
                        ? "s"
                        : ""
                    }`}
              </Text>
            </View>

            <Text style={styles.drawerOrderIcon}>
              🛒
            </Text>
          </View>

          {cart.length === 0 ? (
            <View style={styles.drawerEmptyOrder}>
              <Text style={styles.drawerEmptyIcon}>
                🛍️
              </Text>

              <Text
                style={[
                  styles.drawerEmptyTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Order is empty
              </Text>

              <Text
                style={[
                  styles.drawerEmptyText,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Add food from Menu
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.drawerOrderItems}>
                {cart.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.drawerCartItem,
                      {
                        borderBottomColor:
                          colors.border,
                      },
                    ]}
                  >
                    <View style={styles.drawerCartMain}>
                      <View
                        style={[
                          styles.drawerCartEmoji,
                          {
                            backgroundColor:
                              colors.input,
                          },
                        ]}
                      >
                        <Text>
                          {item.emoji}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.drawerCartInfo
                        }
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.drawerCartName,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>

                        <Text
                          style={[
                            styles.drawerCartPrice,
                            {
                              color: colors.muted,
                            },
                          ]}
                        >
                          {money(item.price)}
                        </Text>

                        <View
                          style={
                            styles.drawerQtyRow
                          }
                        >
                          <Pressable
                            onPress={() =>
                              decreaseQty(item.id)
                            }
                            style={[
                              styles.drawerQtyButton,
                              {
                                backgroundColor:
                                  colors.input,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.drawerQtyButtonText,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              −
                            </Text>
                          </Pressable>

                          <Text
                            style={[
                              styles.drawerQtyText,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {item.qty}
                          </Text>

                          <Pressable
                            onPress={() =>
                              increaseQty(item.id)
                            }
                            style={[
                              styles.drawerQtyButton,
                              {
                                backgroundColor:
                                  colors.red,
                              },
                            ]}
                          >
                            <Text
                              style={
                                styles.drawerQtyButtonText
                              }
                            >
                              +
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.drawerItemTotal,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {money(
                        item.price * item.qty
                      )}
                    </Text>
                  </View>
                ))}
              </View>

              {/* BILL */}
              <View
                style={[
                  styles.drawerBill,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <BillRow
                  label="Subtotal"
                  value={money(subtotal)}
                  colors={colors}
                />

                <BillRow
                  label="Tax 10%"
                  value={money(tax)}
                  colors={colors}
                />

                <View
                  style={[
                    styles.drawerTotalRow,
                    {
                      borderTopColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.drawerTotalTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Total
                  </Text>

                  <Text
                    style={[
                      styles.drawerTotalAmount,
                      {
                        color: colors.red,
                      },
                    ]}
                  >
                    {money(total)}
                  </Text>
                </View>
              </View>

              {/* COMPLETE */}
              <Pressable
                onPress={completeOrder}
                style={[
                  styles.drawerComplete,
                  {
                    backgroundColor:
                      colors.green,
                  },
                ]}
              >
                <Text style={styles.drawerCompleteIcon}>
                  ✓
                </Text>

                <Text style={styles.drawerCompleteText}>
                  Complete Order
                </Text>
              </Pressable>

              {/* CANCEL */}
              <Pressable
                onPress={() => {
                  clearCart();
                  onClose();
                }}
                style={[
                  styles.drawerCancel,
                  {
                    backgroundColor: darkMode
                      ? "#29191b"
                      : "#fff0f0",
                    borderColor: colors.red,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.drawerCancelText,
                    {
                      color: colors.red,
                    },
                  ]}
                >
                  ✕ Cancel Order
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* THEME */}
        <View
          style={[
            styles.themeToggle,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.themeLeft}>
            <Text style={styles.themeIcon}>
              {darkMode ? "🌙" : "☀️"}
            </Text>

            <View>
              <Text
                style={[
                  styles.themeText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {darkMode
                  ? "Dark Mode"
                  : "Light Mode"}
              </Text>

              <Text
                style={[
                  styles.themeSub,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Change app appearance
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              setDarkMode(!darkMode)
            }
            style={[
              styles.themeSwitch,
              {
                backgroundColor: darkMode
                  ? colors.red
                  : colors.border,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.themeKnob,
                {
                  transform: [
                    {
                      translateX: darkMode
                        ? 18
                        : 0,
                    },
                  ],
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.drawerFooter}>
          <Text
            style={[
              styles.drawerFooterText,
              {
                color: colors.muted,
              },
            ]}
          >
            POSFood v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function DrawerButton({
  icon,
  title,
  active,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  active: boolean;
  onPress: () => void;
  colors: typeof DARK;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.drawerButton,
        {
          backgroundColor: active
            ? colors.red
            : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.drawerButtonIcon,
          {
            color: active
              ? "#fff"
              : colors.muted,
          },
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.drawerButtonText,
          {
            color: active
              ? "#fff"
              : colors.text,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   ORDER PANEL
========================================================= */

function OrderPanel({
  cart,
  subtotal,
  tax,
  total,
  increaseQty,
  decreaseQty,
  clearCart,
  completeOrder,
  colors,
}: {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  completeOrder: () => void;
  colors: typeof DARK;
}) {
  return (
    <View
      style={[
        styles.orderPanel,
        {
          backgroundColor: colors.panel,
          borderLeftColor: colors.border,
        },
      ]}
    >
      <View style={styles.orderPanelHeader}>
        <View>
          <Text
            style={[
              styles.orderPanelTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Current Order
          </Text>

          <Text
            style={[
              styles.orderPanelSub,
              {
                color: colors.muted,
              },
            ]}
          >
            {cart.length} item
            {cart.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {cart.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text
              style={[
                styles.clearOrderText,
                {
                  color: colors.red,
                },
              ]}
            >
              Clear
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {cart.length === 0 ? (
          <View style={styles.emptyOrder}>
            <Text style={styles.emptyOrderEmoji}>
              🛒
            </Text>

            <Text
              style={[
                styles.emptyOrderTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No items
            </Text>

            <Text
              style={[
                styles.emptyOrderText,
                {
                  color: colors.muted,
                },
              ]}
            >
              Add food from menu
            </Text>
          </View>
        ) : (
          <>
            {cart.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.orderItem,
                  {
                    borderBottomColor:
                      colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.orderItemEmoji,
                    {
                      backgroundColor:
                        colors.input,
                    },
                  ]}
                >
                  <Text>{item.emoji}</Text>
                </View>

                <View style={styles.orderItemMiddle}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.orderItemName,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      styles.orderItemPrice,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {money(item.price)}
                  </Text>

                  <View
                    style={styles.orderQuantity}
                  >
                    <Pressable
                      onPress={() =>
                        decreaseQty(item.id)
                      }
                      style={[
                        styles.quantityButton,
                        {
                          backgroundColor:
                            colors.input,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quantityButtonText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        −
                      </Text>
                    </Pressable>

                    <Text
                      style={[
                        styles.quantityText,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {item.qty}
                    </Text>

                    <Pressable
                      onPress={() =>
                        increaseQty(item.id)
                      }
                      style={[
                        styles.quantityButton,
                        {
                          backgroundColor:
                            colors.red,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.quantityButtonText
                        }
                      >
                        +
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Text
                  style={[
                    styles.orderItemTotal,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {money(
                    item.price * item.qty
                  )}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View>
          <BillRow
            label="Subtotal"
            value={money(subtotal)}
            colors={colors}
          />

          <BillRow
            label="Tax 10%"
            value={money(tax)}
            colors={colors}
          />

          <View
            style={[
              styles.panelTotal,
              {
                borderTopColor:
                  colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.panelTotalTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Total
            </Text>

            <Text
              style={[
                styles.panelTotalAmount,
                {
                  color: colors.red,
                },
              ]}
            >
              {money(total)}
            </Text>
          </View>

          <Pressable
            onPress={completeOrder}
            style={[
              styles.completeButton,
              {
                backgroundColor:
                  colors.green,
              },
            ]}
          >
            <Text style={styles.completeButtonText}>
              ✓ Complete Order
            </Text>
          </Pressable>

          <Pressable
            onPress={clearCart}
            style={[
              styles.panelCancel,
              {
                backgroundColor: darken(
                  colors.red,
                  0.9
                ),
                borderColor: colors.red,
              },
            ]}
          >
            <Text
              style={[
                styles.panelCancelText,
                {
                  color: colors.red,
                },
              ]}
            >
              ✕ Cancel Order
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  colors,
  cart,
  cartCount,
  total,
  orders,
  onMenu,
}: {
  colors: typeof DARK;
  cart: CartItem[];
  cartCount: number;
  total: number;
  orders: Order[];
  onMenu: () => void;
}) {
  const revenue = orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.dashboard}
    >
      <View>
        <Text
          style={[
            styles.dashboardTitle,
            {
              color: colors.text,
            },
          ]}
        >
          POSFood Dashboard
        </Text>

        <Text
          style={[
            styles.dashboardSubtitle,
            {
              color: colors.muted,
            },
          ]}
        >
          Welcome back 👋
        </Text>
      </View>

      <View style={styles.dashboardCards}>
        <DashboardCard
          icon="🍔"
          title="Current Items"
          value={String(cartCount)}
          colors={colors}
        />

        <DashboardCard
          icon="💰"
          title="Current Total"
          value={money(total)}
          colors={colors}
        />

        <DashboardCard
          icon="🧾"
          title="Total Orders"
          value={String(orders.length)}
          colors={colors}
        />

        <DashboardCard
          icon="📈"
          title="Revenue"
          value={money(revenue)}
          colors={colors}
        />
      </View>

      <View
        style={[
          styles.dashboardCurrent,
          {
            backgroundColor: colors.panel,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.dashboardCurrentHeader}>
          <View>
            <Text
              style={[
                styles.dashboardCurrentTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Current Order
            </Text>

            <Text
              style={[
                styles.dashboardCurrentSub,
                {
                  color: colors.muted,
                },
              ]}
            >
              Quick overview
            </Text>
          </View>

          <Pressable
            onPress={onMenu}
            style={[
              styles.openMenuButton,
              {
                backgroundColor:
                  colors.red,
              },
            ]}
          >
            <Text style={styles.openMenuText}>
              Open Menu
            </Text>
          </Pressable>
        </View>

        {cart.length === 0 ? (
          <View style={styles.dashboardEmpty}>
            <Text style={styles.dashboardEmptyIcon}>
              🛒
            </Text>

            <Text
              style={[
                styles.dashboardEmptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No current order
            </Text>

            <Text
              style={[
                styles.dashboardEmptyText,
                {
                  color: colors.muted,
                },
              ]}
            >
              Add food items from the menu.
            </Text>
          </View>
        ) : (
          <View>
            {cart.slice(0, 4).map((item) => (
              <View
                key={item.id}
                style={[
                  styles.dashboardOrderItem,
                  {
                    borderBottomColor:
                      colors.border,
                  },
                ]}
              >
                <Text style={styles.dashboardOrderEmoji}>
                  {item.emoji}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dashboardOrderName,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      styles.dashboardOrderQty,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    Qty: {item.qty}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.dashboardOrderPrice,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {money(
                    item.price * item.qty
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  colors,
}: {
  icon: string;
  title: string;
  value: string;
  colors: typeof DARK;
}) {
  return (
    <View
      style={[
        styles.dashboardCard,
        {
          backgroundColor: colors.panel,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.dashboardCardIcon,
          {
            backgroundColor: colors.input,
          },
        ]}
      >
        <Text style={styles.dashboardCardEmoji}>
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.dashboardCardTitle,
          {
            color: colors.muted,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.dashboardCardValue,
          {
            color: colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function History({
  colors,
  orders,
}: {
  colors: typeof DARK;
  orders: Order[];
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.history}
    >
      <Text
        style={[
          styles.pageTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Order History
      </Text>

      <Text
        style={[
          styles.pageSubtitle,
          {
            color: colors.muted,
          },
        ]}
      >
        Your completed orders
      </Text>

      {orders.length === 0 ? (
        <View style={styles.historyEmpty}>
          <Text style={styles.historyEmptyIcon}>
            🧾
          </Text>

          <Text
            style={[
              styles.historyEmptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            No orders yet
          </Text>

          <Text
            style={[
              styles.historyEmptyText,
              {
                color: colors.muted,
              },
            ]}
          >
            Completed orders will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {orders.map((order) => (
            <View
              key={order.id}
              style={[
                styles.historyCard,
                {
                  backgroundColor:
                    colors.panel,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={styles.historyCardHeader}
              >
                <View>
                  <Text
                    style={[
                      styles.historyOrderId,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {order.id}
                  </Text>

                  <Text
                    style={[
                      styles.historyDate,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {order.date}
                  </Text>
                </View>

                <View
                  style={[
                    styles.completedBadge,
                    {
                      backgroundColor:
                        darken(
                          colors.green,
                          0.15
                        ),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.completedBadgeText,
                      {
                        color:
                          colors.green,
                      },
                    ]}
                  >
                    Completed
                  </Text>
                </View>
              </View>

              <View style={styles.historyItems}>
                {order.items.map((item) => (
                  <View
                    key={item.id}
                    style={
                      styles.historyItem
                    }
                  >
                    <Text>
                      {item.emoji}
                    </Text>

                    <Text
                      style={[
                        styles.historyItemName,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {item.name} ×{" "}
                      {item.qty}
                    </Text>

                    <Text
                      style={[
                        styles.historyItemPrice,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {money(
                        item.price *
                          item.qty
                      )}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={[
                  styles.historyTotal,
                  {
                    borderTopColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyTotalLabel,
                    {
                      color:
                        colors.muted,
                    },
                  ]}
                >
                  Total
                </Text>

                <Text
                  style={[
                    styles.historyTotalValue,
                    {
                      color: colors.red,
                    },
                  ]}
                >
                  {money(order.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings({
  colors,
  darkMode,
  setDarkMode,
}: {
  colors: typeof DARK;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.settings}
    >
      <Text
        style={[
          styles.pageTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Settings
      </Text>

      <Text
        style={[
          styles.pageSubtitle,
          {
            color: colors.muted,
          },
        ]}
      >
        Customize your POSFood app
      </Text>

      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor:
              colors.panel,
            borderColor:
              colors.border,
          },
        ]}
      >
        <SettingRow
          icon="🌙"
          title="Dark Mode"
          description="Use dark appearance"
          colors={colors}
          right={
            <Pressable
              onPress={() =>
                setDarkMode(!darkMode)
              }
              style={[
                styles.themeSwitch,
                {
                  backgroundColor:
                    darkMode
                      ? colors.red
                      : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.themeKnob,
                  {
                    transform: [
                      {
                        translateX:
                          darkMode
                            ? 18
                            : 0,
                      },
                    ],
                  },
                ]}
              />
            </Pressable>
          }
        />

        <SettingRow
          icon="🏪"
          title="Restaurant"
          description="Pakecho Restaurant"
          colors={colors}
        />

        <SettingRow
          icon="💵"
          title="Currency"
          description="US Dollar ($)"
          colors={colors}
        />

        <SettingRow
          icon="🧾"
          title="Tax"
          description="10% sales tax"
          colors={colors}
        />

        <SettingRow
          icon="ℹ️"
          title="App Version"
          description="POSFood v1.0"
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  title,
  description,
  colors,
  right,
}: {
  icon: string;
  title: string;
  description: string;
  colors: typeof DARK;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.settingRow,
        {
          borderBottomColor:
            colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor:
              colors.input,
          },
        ]}
      >
        <Text>{icon}</Text>
      </View>

      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingDescription,
            {
              color: colors.muted,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      {right}
    </View>
  );
}

/* =========================================================
   BILL
========================================================= */

function BillRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof DARK;
}) {
  return (
    <View style={styles.billRow}>
      <Text
        style={[
          styles.billLabel,
          {
            color: colors.muted,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.billValue,
          {
            color: colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   COLOR HELPER
========================================================= */

function darken(hex: string, amount: number) {
  if (!hex.startsWith("#")) {
    return hex;
  }

  const value = hex.replace("#", "");

  const num = parseInt(value, 16);

  const r = Math.max(
    0,
    Math.min(
      255,
      Math.floor(
        ((num >> 16) & 255) * amount
      )
    )
  );

  const g = Math.max(
    0,
    Math.min(
      255,
      Math.floor(
        ((num >> 8) & 255) * amount
      )
    )
  );

  const b = Math.max(
    0,
    Math.min(
      255,
      Math.floor((num & 255) * amount)
    )
  );

  return `rgb(${r}, ${g}, ${b})`;
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  app: {
    flex: 1,
    flexDirection: "row",
  },

  main: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  /* SIDEBAR */

  sidebar: {
    width: 90,
    borderRightWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },

  logoBox: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  logoEmoji: {
    fontSize: 24,
  },

  logoText: {
    fontSize: 13,
    fontWeight: "800",
  },

  sidebarMenu: {
    gap: 8,
  },

  sidebarButton: {
    height: 58,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  sidebarIcon: {
    fontSize: 21,
  },

  sidebarText: {
    fontSize: 10,
    fontWeight: "700",
  },

  sidebarBottom: {
    alignItems: "center",
  },

  versionText: {
    fontSize: 9,
    marginTop: 3,
  },

  /* HEADER */

  header: {
    width: "100%",
    minHeight: 64,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  headerButtonText: {
    color: "#fff",
    fontSize: 20,
  },

  restaurantName: {
    fontSize: 17,
    fontWeight: "800",
  },

  dateText: {
    fontSize: 11,
    marginTop: 3,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  headerCart: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  headerCartIcon: {
    fontSize: 19,
  },

  headerCartBadge: {
    position: "absolute",
    right: -4,
    top: -5,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCartBadgeText: {
    color: "#111",
    fontSize: 10,
    fontWeight: "900",
  },

  /* MENU */

  menuScroll: {
    padding: 18,
  },

  menuTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "900",
  },

  pageSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  orderMiniButton: {
    minWidth: 50,
    height: 44,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 4,
  },

  orderMiniIcon: {
    fontSize: 18,
  },

  orderMiniText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  searchBox: {
    height: 47,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },

  clearSearch: {
    fontSize: 14,
    padding: 5,
  },

  categories: {
    gap: 8,
    paddingBottom: 17,
  },

  categoryButton: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "800",
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  productCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  productImage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  productEmoji: {
    textAlign: "center",
  },

  productNumber: {
    position: "absolute",
    left: 8,
    top: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  productNumberText: {
    fontSize: 8,
    fontWeight: "800",
  },

  productInfo: {
    padding: 10,
  },

  productName: {
    fontWeight: "800",
  },

  productCategory: {
    fontSize: 10,
    marginTop: 3,
  },

  productBottom: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productPrice: {
    fontWeight: "900",
  },

  addButton: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "500",
  },

  noProducts: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  noProductsIcon: {
    fontSize: 45,
  },

  noProductsTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },

  noProductsText: {
    fontSize: 12,
    marginTop: 5,
  },

  /* DRAWER */

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    zIndex: 10,
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },

  drawerInner: {
    flex: 1,
  },

  drawerScroll: {
    padding: 16,
    paddingBottom: 30,
  },

  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  drawerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  drawerLogo: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  drawerLogoText: {
    fontSize: 23,
  },

  drawerBrandName: {
    fontSize: 18,
    fontWeight: "900",
  },

  drawerBrandSub: {
    fontSize: 10,
    marginTop: 2,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },

  drawerNavigation: {
    marginBottom: 18,
  },

  drawerSectionTitle: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },

  drawerButton: {
    height: 47,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 5,
  },

  drawerButtonIcon: {
    width: 30,
    fontSize: 19,
  },

  drawerButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },

  drawerOrder: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },

  drawerOrderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  drawerOrderTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  drawerOrderSub: {
    fontSize: 10,
    marginTop: 2,
  },

  drawerOrderIcon: {
    fontSize: 22,
  },

  drawerEmptyOrder: {
    alignItems: "center",
    paddingVertical: 22,
  },

  drawerEmptyIcon: {
    fontSize: 35,
  },

  drawerEmptyTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
  },

  drawerEmptyText: {
    fontSize: 10,
    marginTop: 3,
  },

  drawerOrderItems: {
    maxHeight: 310,
  },

  drawerCartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  drawerCartMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  drawerCartEmoji: {
    width: 37,
    height: 37,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  drawerCartInfo: {
    flex: 1,
  },

  drawerCartName: {
    fontSize: 11,
    fontWeight: "800",
  },

  drawerCartPrice: {
    fontSize: 9,
    marginTop: 2,
  },

  drawerQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
  },

  drawerQtyButton: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  drawerQtyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  drawerQtyText: {
    minWidth: 15,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
  },

  drawerItemTotal: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 8,
  },

  drawerBill: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 9,
  },

  drawerBillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  billLabel: {
    fontSize: 11,
  },

  billValue: {
    fontSize: 11,
    fontWeight: "700",
  },

  drawerTotalRow: {
    borderTopWidth: 1,
    marginTop: 5,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  drawerTotalTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  drawerTotalAmount: {
    fontSize: 17,
    fontWeight: "900",
  },

  drawerComplete: {
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 12,
  },

  drawerCompleteIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  drawerCompleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  drawerCancel: {
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  drawerCancelText: {
    fontSize: 12,
    fontWeight: "900",
  },

  themeToggle: {
    minHeight: 60,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  themeIcon: {
    fontSize: 20,
  },

  themeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  themeSub: {
    fontSize: 9,
    marginTop: 2,
  },

  themeSwitch: {
    width: 42,
    height: 24,
    borderRadius: 20,
    padding: 3,
    justifyContent: "center",
  },

  themeKnob: {
    width: 18,
    height: 18,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  drawerFooter: {
    alignItems: "center",
    paddingVertical: 18,
  },

  drawerFooterText: {
    fontSize: 9,
  },

  /* FLOATING CART */

  floatingOrder: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  floatingIcon: {
    fontSize: 23,
  },

  floatingBadge: {
    position: "absolute",
    right: -3,
    top: -4,
    minWidth: 21,
    height: 21,
    borderRadius: 20,
    paddingHorizontal: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  floatingBadgeText: {
    color: "#111",
    fontSize: 10,
    fontWeight: "900",
  },

  /* ORDER PANEL */

  orderPanel: {
    width: 310,
    borderLeftWidth: 1,
    padding: 16,
  },

  orderPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  orderPanelTitle: {
    fontSize: 19,
    fontWeight: "900",
  },

  orderPanelSub: {
    fontSize: 10,
    marginTop: 3,
  },

  clearOrderText: {
    fontSize: 11,
    fontWeight: "800",
  },

  emptyOrder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  emptyOrderEmoji: {
    fontSize: 45,
  },

  emptyOrderTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyOrderText: {
    fontSize: 11,
    marginTop: 4,
  },

  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  orderItemEmoji: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  orderItemMiddle: {
    flex: 1,
  },

  orderItemName: {
    fontSize: 12,
    fontWeight: "800",
  },

  orderItemPrice: {
    fontSize: 9,
    marginTop: 2,
  },

  orderQuantity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 7,
  },

  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  quantityText: {
    fontSize: 11,
    minWidth: 15,
    textAlign: "center",
    fontWeight: "900",
  },

  orderItemTotal: {
    fontSize: 11,
    fontWeight: "900",
  },

  panelTotal: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelTotalTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  panelTotalAmount: {
    fontSize: 20,
    fontWeight: "900",
  },

  completeButton: {
    height: 47,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  completeButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  panelCancel: {
    height: 43,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  panelCancelText: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* DASHBOARD */

  dashboard: {
    padding: 20,
    paddingBottom: 40,
  },

  dashboardTitle: {
    fontSize: 27,
    fontWeight: "900",
  },

  dashboardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  dashboardCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },

  dashboardCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
  },

  dashboardCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  dashboardCardEmoji: {
    fontSize: 20,
  },

  dashboardCardTitle: {
    fontSize: 10,
    fontWeight: "700",
  },

  dashboardCardValue: {
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
  },

  dashboardCurrent: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },

  dashboardCurrentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dashboardCurrentTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  dashboardCurrentSub: {
    fontSize: 10,
    marginTop: 3,
  },

  openMenuButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  openMenuText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  dashboardEmpty: {
    alignItems: "center",
    paddingVertical: 40,
  },

  dashboardEmptyIcon: {
    fontSize: 42,
  },

  dashboardEmptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 8,
  },

  dashboardEmptyText: {
    fontSize: 10,
    marginTop: 3,
  },

  dashboardOrderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },

  dashboardOrderEmoji: {
    fontSize: 25,
  },

  dashboardOrderName: {
    fontSize: 12,
    fontWeight: "800",
  },

  dashboardOrderQty: {
    fontSize: 9,
    marginTop: 3,
  },

  dashboardOrderPrice: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* HISTORY */

  history: {
    padding: 20,
    paddingBottom: 40,
  },

  historyList: {
    gap: 12,
    marginTop: 22,
  },

  historyCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
  },

  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  historyOrderId: {
    fontSize: 14,
    fontWeight: "900",
  },

  historyDate: {
    fontSize: 9,
    marginTop: 3,
  },

  completedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  completedBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  historyItems: {
    marginTop: 12,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
  },

  historyItemName: {
    flex: 1,
    fontSize: 11,
  },

  historyItemPrice: {
    fontSize: 11,
    fontWeight: "800",
  },

  historyTotal: {
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  historyTotalLabel: {
    fontSize: 11,
    fontWeight: "700",
  },

  historyTotalValue: {
    fontSize: 15,
    fontWeight: "900",
  },

  historyEmpty: {
    alignItems: "center",
    paddingVertical: 100,
  },

  historyEmptyIcon: {
    fontSize: 50,
  },

  historyEmptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },

  historyEmptyText: {
    fontSize: 11,
    marginTop: 4,
  },

  /* SETTINGS */

  settings: {
    padding: 20,
    paddingBottom: 40,
  },

  settingsCard: {
    marginTop: 22,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  settingRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  settingIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 12,
    fontWeight: "900",
  },

  settingDescription: {
    fontSize: 9,
    marginTop: 3,
  },
});