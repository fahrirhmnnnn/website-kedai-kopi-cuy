document.addEventListener("alpine:init", () => {
  // Logika untuk menampilkan produk dan detailnya
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Espresso", img: "1.jpg", price: 20000, desc: "Kopi hitam murni dengan konsentrasi tinggi. Rasa kuat dan aroma intens." },
      { id: 2, name: "Americano", img: "2.jpg", price: 25000, desc: "Perpaduan sempurna antara espresso dan air panas. Ringan namun tetap berenergi." },
      { id: 3, name: "Latte", img: "3.jpg", price: 30000, desc: "Kopi lembut dengan susu panas dan busa tipis. Pilihan favorit untuk kenikmatan creamy." },
      { id: 4, name: "Cappuccino", img: "4.jpg", price: 30000, desc: "Espresso dengan foam susu tebal dan lembut. Cita rasa klasik yang menggoda." },
      { id: 5, name: "Mocaccino", img: "5.jpg", price: 35000, desc: "Perpaduan kopi, susu, dan cokelat manis. Memberikan sentuhan manis yang memanjakan." },
    ],
    showDetail: false,
    detailProduct: null,
    showProductDetail(item) {
      this.detailProduct = item;
      this.showDetail = true;
      return true;
    },
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yang sama dicart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada / cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          // jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item yang mau diremove berdasarkan idnya
      const cartItem = this.items.find((item) => item.id === id);

      // jika item lebih dari 1
      if (cartItem.quantity > 1) {
        // telusuri 1 1
        this.items = this.items.map((item) => {
          // jika bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ketika tombol checkout diklik
checkoutButton.addEventListener("click", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);

  // Ambil data cart dari Alpine.js
  const cartItems = Alpine.store("cart").items;
  const cartTotal = Alpine.store("cart").total;

  // Masukkan data cart dan total ke dalam objek data
  objData.items = cartItems;
  objData.total = cartTotal;

  const message = formatMessage(objData);
  window.open("http://wa.me/6289673994087?text=" + encodeURIComponent(message));
});

// format pesan whatsapp
const formatMessage = (obj) => {
  return `Data Customer
  Nama: ${obj.name}
  Email: ${obj.email}
  No HP: ${obj.phone}
  
Data Pesanan
${obj.items.map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)})`).join("\n")}

TOTAL: ${rupiah(obj.total)}
Terima kasih.`;
};
// konversi ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
