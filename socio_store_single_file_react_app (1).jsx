import React, { useState, useEffect } from "react";

// Socio Store - Single-file React component
// - TailwindCSS classes used for styling (assumes Tailwind is configured in the host project)
// - Local-state-only demo (no backend). Good starting point to wire to APIs later.

export default function SocioStoreApp() {
  // --- User & Social state ---
  const [currentUser, setCurrentUser] = useState({ id: 1, name: "You" });
  const [users, setUsers] = useState([
    { id: 1, name: "You", following: [] },
    { id: 2, name: "Ayesha", following: [] },
    { id: 3, name: "Bilal", following: [] },
  ]);

  const initialPosts = [
    {
      id: 1,
      authorId: 2,
      text: "Ski season incoming! Ready my winter jacket ☃️",
      likes: 4,
      likedByMe: false,
      comments: [{ id: 1, author: 3, text: "Nice jacket!" }],
      shares: 1,
      createdAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 2,
      authorId: 3,
      text: "Hot chocolate & wool socks = perfect combo",
      likes: 2,
      likedByMe: false,
      comments: [],
      shares: 0,
      createdAt: Date.now() - 1000 * 60 * 30,
    },
  ];

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("socio_posts");
    return saved ? JSON.parse(saved) : initialPosts;
  });

  useEffect(() => {
    localStorage.setItem("socio_posts", JSON.stringify(posts));
  }, [posts]);

  // --- Reels (simple video carousel) ---
  const reels = [
    { id: 1, title: "Winter Walk", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    { id: 2, title: "Cozy Fireplace", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  ];
  const [activeReel, setActiveReel] = useState(0);

  // --- Store / Products ---
  // User requested winter products priced PKR 1000 - PKR 2000 (interpreted OKR2000 as PKR 2000)
  const initialProducts = [
    { id: 101, title: "Wool Winter Scarf", pricePKR: 1200, stock: 20, img: "" },
    { id: 102, title: "Thermal Gloves", pricePKR: 1000, stock: 35, img: "" },
    { id: 103, title: "Knit Beanie", pricePKR: 1400, stock: 10, img: "" },
    { id: 104, title: "Insulated Jacket", pricePKR: 2000, stock: 5, img: "" },
    { id: 105, title: "Wool Socks (pair)", pricePKR: 1100, stock: 50, img: "" },
  ];

  const [products] = useState(initialProducts);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("socio_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("socio_cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart((c) => {
      const found = c.find((x) => x.id === product.id);
      if (found) return c.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...product, qty: 1 }];
    });
  }

  function updateQty(id, qty) {
    setCart((c) => c.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));
  }

  function removeFromCart(id) {
    setCart((c) => c.filter((it) => it.id !== id));
  }

  const cartTotal = cart.reduce((s, i) => s + i.pricePKR * i.qty, 0);

  // --- Checkout ---
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", address: "", paymentMethod: "COD" });

  function completeCheckout() {
    // Very small simulator: reduce stock, create a simple order object, clear cart
    const order = {
      id: Math.floor(Math.random() * 1000000),
      items: cart,
      totalPKR: cartTotal,
      createdAt: new Date().toISOString(),
      shippingTo: checkoutForm.address,
      name: checkoutForm.name || currentUser.name,
      paymentMethod: checkoutForm.paymentMethod,
    };
    setOrderComplete(order);
    setCart([]);
    setCheckoutOpen(false);
  }

  // --- Social interactions ---
  function toggleLike(postId) {
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 } : p)));
  }

  function addComment(postId, text) {
    if (!text) return;
    setPosts((ps) =>
      ps.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), author: currentUser.id, text }] } : p))
    );
  }

  function sharePost(postId) {
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)));
    // try to copy link
    const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    alert("Post link copied to clipboard (simulated)!");
  }

  function followUser(targetId) {
    setUsers((us) => us.map((u) => (u.id === currentUser.id ? { ...u, following: Array.from(new Set([...u.following, targetId])) } : u)));
  }
  function unfollowUser(targetId) {
    setUsers((us) => us.map((u) => (u.id === currentUser.id ? { ...u, following: u.following.filter((id) => id !== targetId) } : u)));
  }

  // --- Create a new post ---
  const [newPostText, setNewPostText] = useState("");
  function createPost() {
    if (!newPostText.trim()) return;
    const p = {
      id: Date.now(),
      authorId: currentUser.id,
      text: newPostText.trim(),
      likes: 0,
      likedByMe: false,
      comments: [],
      shares: 0,
      createdAt: Date.now(),
    };
    setPosts((s) => [p, ...s]);
    setNewPostText("");
  }

  // --- UI routing ---
  const [page, setPage] = useState("feed"); // 'feed' or 'store' or 'reels' or 'profile'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold">SOCIO STORE</div>
            <div className="text-sm text-slate-500">Social + Store</div>
          </div>
          <nav className="flex items-center gap-3">
            <button className={`px-3 py-1 rounded ${page === "feed" ? "bg-slate-100" : ""}`} onClick={() => setPage("feed")}>
              Feed
            </button>
            <button className={`px-3 py-1 rounded ${page === "reels" ? "bg-slate-100" : ""}`} onClick={() => setPage("reels")}>
              Reels
            </button>
            <button className={`px-3 py-1 rounded ${page === "store" ? "bg-slate-100" : ""}`} onClick={() => setPage("store")}>
              Store
            </button>
            <button className={`px-3 py-1 rounded ${page === "profile" ? "bg-slate-100" : ""}`} onClick={() => setPage("profile")}>
              Profile
            </button>
            <div className="relative">
              <button className="px-3 py-1 rounded border" onClick={() => setCheckoutOpen((s) => !s)}>
                Cart ({cart.reduce((s, it) => s + it.qty, 0)})
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          {page === "feed" && (
            <div>
              <div className="bg-white p-4 rounded shadow-sm mb-4">
                <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="What's happening?"
                  className="w-full p-3 border rounded resize-none" rows={3}></textarea>
                <div className="flex justify-end mt-2 gap-2">
                  <button className="px-4 py-2 bg-slate-800 text-white rounded" onClick={createPost}>Post</button>
                </div>
              </div>

              {posts.map((p) => {
                const author = users.find((u) => u.id === p.authorId) || { name: "Unknown" };
                return (
                  <article key={p.id} id={`post-${p.id}`} className="bg-white p-4 rounded shadow-sm mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">{author.name[0]}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{author.name}</div>
                            <div className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentUser.id !== p.authorId && (
                              users.find((u) => u.id === currentUser.id).following.includes(p.authorId) ? (
                                <button onClick={() => unfollowUser(p.authorId)} className="text-sm px-2 py-1 border rounded">Unfollow</button>
                              ) : (
                                <button onClick={() => followUser(p.authorId)} className="text-sm px-2 py-1 rounded bg-slate-100">Follow</button>
                              )
                            )}
                          </div>
                        </div>

                        <p className="mt-3 text-slate-800">{p.text}</p>

                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <button onClick={() => toggleLike(p.id)} className="flex items-center gap-2">{p.likedByMe ? '❤️' : '🤍'} {p.likes}</button>
                          <button onClick={() => {
                            const comment = prompt('Write a comment:');
                            if (comment) addComment(p.id, comment);
                          }}>💬 {p.comments.length}</button>
                          <button onClick={() => sharePost(p.id)}>🔗 Share ({p.shares})</button>
                        </div>

                        {p.comments.length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            {p.comments.map((c) => (
                              <div key={c.id} className="text-sm py-1">
                                <span className="font-semibold">{(users.find(u=>u.id===c.author)||{name:'User'}).name}:</span> {c.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {page === "reels" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Reels</h3>
                  <div className="text-sm text-slate-500">{activeReel + 1} / {reels.length}</div>
                </div>
                <div className="aspect-w-16 aspect-h-9 bg-black rounded overflow-hidden">
                  <video key={reels[activeReel].id} src={reels[activeReel].src} controls autoPlay muted loop className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setActiveReel((s) => (s - 1 + reels.length) % reels.length)} className="px-3 py-1 border rounded">Prev</button>
                  <button onClick={() => setActiveReel((s) => (s + 1) % reels.length)} className="px-3 py-1 border rounded">Next</button>
                </div>
              </div>
            </div>
          )}

          {page === "store" && (
            <div>
              <h2 className="text-xl font-semibold mb-3">SOCIO STORE — Winter Collection (PKR 1,000 - 2,000)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded shadow-sm flex flex-col">
                    <div className="h-36 bg-slate-100 rounded mb-3 flex items-center justify-center">Image</div>
                    <div className="flex-1">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-slate-600">PKR {p.pricePKR.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Stock: {p.stock}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => addToCart(p)} className="px-3 py-2 bg-slate-800 text-white rounded flex-1">Add to cart</button>
                      <button onClick={() => {
                        setCart([{ ...p, qty: 1 }]);
                        setCheckoutOpen(true);
                      }} className="px-3 py-2 border rounded">Buy Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "profile" && (
            <div className="bg-white p-4 rounded shadow-sm">
              <h2 className="text-xl font-semibold">{currentUser.name}'s Profile</h2>
              <p className="text-slate-600">Following: {users.find(u=>u.id===currentUser.id).following.length}</p>
              <div className="mt-3">
                <h3 className="font-semibold mb-2">People</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.filter(u=>u.id!==currentUser.id).map(u=> (
                    <div key={u.id} className="p-3 border rounded flex items-center justify-between">
                      <div>{u.name}</div>
                      {users.find(x=>x.id===currentUser.id).following.includes(u.id) ? (
                        <button onClick={()=>unfollowUser(u.id)} className="text-sm px-2 py-1 border rounded">Unfollow</button>
                      ) : (
                        <button onClick={()=>followUser(u.id)} className="text-sm px-2 py-1 rounded bg-slate-100">Follow</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="font-semibold">Cart</h4>
            {cart.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">Your cart is empty</div>
            ) : (
              <div className="space-y-3">
                {cart.map((it) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-xs">PKR {it.pricePKR} x {it.qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={it.qty} onChange={(e)=>updateQty(it.id, parseInt(e.target.value||1))} className="w-16 p-1 border rounded"/>
                      <button onClick={()=>removeFromCart(it.id)} className="px-2 py-1 border rounded">Remove</button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-semibold">Total: <span>PKR {cartTotal.toLocaleString()}</span></div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>setCheckoutOpen(true)} className="flex-1 px-3 py-2 bg-slate-800 text-white rounded">Checkout</button>
                    <button onClick={()=>{ setCart([]); }} className="px-3 py-2 border rounded">Clear</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="font-semibold">People to follow</h4>
            <div className="mt-2 space-y-2">
              {users.filter(u=>u.id!==currentUser.id).map(u => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="text-sm">{u.name}</div>
                  {users.find(x=>x.id===currentUser.id).following.includes(u.id) ? (
                    <button onClick={()=>unfollowUser(u.id)} className="text-xs px-2 py-1 border rounded">Unfollow</button>
                  ) : (
                    <button onClick={()=>followUser(u.id)} className="text-xs px-2 py-1 rounded bg-slate-100">Follow</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm text-sm text-slate-500">
            SOCIO STORE is a demo combining social features (post, reels, comments, likes, share, follow) and an online store with checkout that completes an order locally (no payment gateway).
          </div>
        </aside>
      </main>

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-4">
            <h3 className="font-semibold">Checkout</h3>
            {cart.length === 0 ? (
              <div className="py-6 text-center">Your cart is empty</div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm">Total: <strong>PKR {cartTotal.toLocaleString()}</strong></div>
                <input className="w-full p-2 border rounded" placeholder="Full name" value={checkoutForm.name} onChange={(e)=>setCheckoutForm(f=>({...f, name: e.target.value}))} />
                <textarea className="w-full p-2 border rounded" placeholder="Shipping address" value={checkoutForm.address} onChange={(e)=>setCheckoutForm(f=>({...f, address: e.target.value}))} />
                <select className="w-full p-2 border rounded" value={checkoutForm.paymentMethod} onChange={(e)=>setCheckoutForm(f=>({...f, paymentMethod: e.target.value}))}>
                  <option>COD</option>
                  <option>Bank Transfer</option>
                  <option>Card (simulated)</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={completeCheckout} className="flex-1 px-3 py-2 bg-slate-800 text-white rounded">Complete Order</button>
                  <button onClick={()=>setCheckoutOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {orderComplete && (
        <div className="fixed bottom-4 right-4 bg-emerald-50 border border-emerald-200 p-3 rounded shadow">
          <div className="font-semibold">Order Confirmed</div>
          <div className="text-sm">Order #{orderComplete.id} — PKR {orderComplete.totalPKR.toLocaleString()}</div>
          <div className="text-xs text-slate-600">Shipping to: {orderComplete.shippingTo}</div>
          <div className="mt-2 text-right">
            <button onClick={()=>setOrderComplete(null)} className="px-2 py-1 text-xs border rounded">Dismiss</button>
          </div>
        </div>
      )}

      <footer className="mt-8 py-6 text-center text-xs text-slate-500">SOCIO STORE · Demo shop & social feed · Prices shown in PKR</footer>
    </div>
  );
}
