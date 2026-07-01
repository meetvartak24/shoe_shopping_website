import { data } from "./data.js"

// ── DOM elements ──
const grid = document.querySelector(".product_grid")
const product_card = document.querySelector(".product_card")
const filter_btns = document.querySelectorAll(".filter_btn")
const filter_lists = document.querySelectorAll(".filter_list")
const filter_items = document.querySelectorAll(".filter_item")
const clear_btn = document.querySelector(".clear_btn")
const cart_count = document.querySelector(".badge")
const number_of_products = document.querySelector(".count")
const sort_select = document.querySelector(".sort_select")

// ── State ──
const cartItems = new Set()
let currentData = [...data]
let currentSort = "featured"

// ── Functions ──
function actual_data(input_data) {
  grid.innerHTML = ""

  input_data.forEach((item) => {
    const card = product_card.cloneNode(true)

    const image = card.querySelector(".product_img_el")
    image.src = item.img_url
    image.alt = item.brand_name

    card.querySelector(".product_brand").textContent = item.brand_name
    card.querySelector(".product_name").textContent = item.shoe_name
    card.querySelector(".product_price").textContent = item.price_in_rupee

    const add_to_cart = card.querySelector(".add_btn")

    if (cartItems.has(item.shoe_name)) {
      add_to_cart.classList.add("active")
      add_to_cart.textContent = "Added to cart 🛒"
    }

    add_to_cart.addEventListener("click", () => {
      const isActive = add_to_cart.classList.toggle("active")

      if (isActive) {
        cartItems.add(item.shoe_name)
        add_to_cart.textContent = "Added to cart 🛒"
      } else {
        cartItems.delete(item.shoe_name)
        add_to_cart.textContent = "Add to Cart"
      }

      cart_count.textContent = cartItems.size
    })

    grid.append(card)
  })

  number_of_products.textContent = input_data.length
}

function applySortToCurrentData() {
  if (currentSort === "low") {
    const sorted = [...currentData].sort((a, b) =>
      parseInt(a.price_in_rupee.replace(/[₹,]/g, "")) - parseInt(b.price_in_rupee.replace(/[₹,]/g, ""))
    )
    actual_data(sorted)
  }
  else if (currentSort === "high") {
    const sorted = [...currentData].sort((a, b) =>
      parseInt(b.price_in_rupee.replace(/[₹,]/g, "")) - parseInt(a.price_in_rupee.replace(/[₹,]/g, ""))
    )
    actual_data(sorted)
  }
  else {
    actual_data(currentData)
  }
}

function applyFilters() {
  const selectedBrands = [...document.querySelectorAll(".drop_down_com .filter_item.selected")]
    .map(el => el.textContent.trim().toLowerCase())
  const selectedColors = [...document.querySelectorAll(".drop_down_color .filter_item.selected")]
    .map(el => el.textContent.trim().toLowerCase())
  const selectedPrices = [...document.querySelectorAll(".drop_down_price .filter_item.selected")]
    .map(el => el.textContent.trim().toLowerCase())

  if (selectedBrands.length === 0 && selectedColors.length === 0 && selectedPrices.length === 0) {
    currentData = [...data]
    applySortToCurrentData()
    return
  }

  const filtered = data.filter((item) => {
    const price = parseInt(item.price_in_rupee.replace(/[₹,]/g, ""))

    const brandMatch = selectedBrands.length === 0 ||
      selectedBrands.includes(item.brand_name.toLowerCase())

    const colorMatch = selectedColors.length === 0 ||
      selectedColors.some(c => item.color.toLowerCase().includes(c))

    const priceMatch = selectedPrices.length === 0 ||
      selectedPrices.some(range => {
        if (range.includes("1000") && range.includes("5000"))  return price >= 1000 && price <= 5000
        if (range.includes("5000") && range.includes("7000"))  return price >= 5000 && price <= 7000
        if (range.includes("7000") && range.includes("10"))    return price >= 7000 && price <= 10000
        if (range.includes("10") && range.includes("15"))      return price >= 10000 && price <= 15000
        if (range.includes("above"))                           return price > 15000
        return false
      })

    return brandMatch && colorMatch && priceMatch
  })

  if (filtered.length === 0) {
    grid.innerHTML = ""
    grid.classList.add("loading")
    grid.textContent = "Currently unavailable..."
  } else {
    currentData = filtered
    grid.classList.remove("loading")
    applySortToCurrentData()
  }
}

// ── Remove template only once ──
product_card.remove()

// ── Initial render ──
actual_data(data)

// ── Filter item clicks ──
filter_items.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation()
    item.classList.toggle("selected")
    applyFilters()
  })
})

// ── Filter button dropdowns ──
filter_btns.forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation()
    filter_lists[index].classList.toggle("show")
    btn.classList.toggle("open")
    btn.querySelector(".arrow").classList.toggle("open")
  })
})

// ── Clear filters ──
clear_btn.addEventListener("click", () => {
  filter_items.forEach(item => item.classList.remove("selected"))
  currentData = [...data]
  currentSort = "featured"
  sort_select.value = "featured"
  actual_data(data)
})

// ── Sort ──
sort_select.addEventListener("change", () => {
  currentSort = sort_select.value
  applySortToCurrentData()
})

// ── Close dropdowns on outside click ──
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter_group") && !e.target.closest(".clear_btn")) {
    filter_lists.forEach(l => l.classList.remove("show"))
    filter_btns.forEach(b => {
      b.classList.remove("open")
      b.querySelector(".arrow").classList.remove("open")
    })
  }
})