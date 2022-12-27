import { currencies } from "./currencies.js";
const btn = document.querySelector(".btn");
const pickCurrencyList = document.getElementById("pickCurrencyList");
const currencyList = document.getElementById("currencyList");
let baseCurrency;
let baseCurrencyAmount;

let starters = ["USD", "EUR", "GBP", "JPY"];

function createPickList() {
  for (let i = 0; i < currencies.length; i++) {
    pickCurrencyList.insertAdjacentHTML(
      "beforeend",
      `
      <li class="unselectedCurrency" data-currency=${currencies[i].short} >
      <img src="${currencies[i].flag}" alt="${currencies[i].currencyName}">
      <p>${currencies[i].currencyName}</p>
      </li>`
    );
  }
}

async function getTime() {
  document.querySelector(".date").textContent = new Date()
    .toDateString()
    .slice(4);
}
getTime();

async function getRates() {
  try {
    const keyJSON = await fetch("API_KEY.json");
    const { api_key } = await keyJSON.json();
    const i = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${api_key}`
    );
    const data = await i.json();
    currencies.forEach(
      (currency) => (currency.rate = data.data[currency.short])
    );
    createPickList();
    starterCurrency();
  } catch (error) {
    console.log();
    currencyList.innerHTML = `<div class="fof"><p>Sorry, something went wrong.</p> </p> Have you added your API key? </p></div>`;
  }
}
getRates();

// BUTTON \\

btn.addEventListener("click", () => {
  btn.classList.toggle("opened");
  if (btn.classList.contains("opened")) {
    btn.textContent = "Go Back";
  } else {
    btn.textContent = "Pick Currency";
  }
});

// REMOVE BOX \\
currencyList.addEventListener("click", removeCurrencyBox);

function removeCurrencyBox(event) {
  if (event.target.classList.contains("close")) {
    const parentNode = event.target.parentNode;
    parentNode.remove();
    pickCurrencyList
      .querySelector(`[data-currency=${parentNode.id}]`)
      .classList.remove("picked");
    if (parentNode.classList.contains("base-currency")) {
      const newBaseCurrency = currencyList.querySelector(".currencyBox");
      if (newBaseCurrency) {
        setNewBaseCurrency(newBaseCurrency);
        baseCurrencyAmount = Number(
          newBaseCurrency.querySelector("input").value
        );
      }
    }
  }
}

// NEW BASE CURRENCY \\

function setNewBaseCurrency(newBaseCurrency) {
  newBaseCurrency.classList.add("base-currency");
  baseCurrency = newBaseCurrency.id;
  const baseCurrencyRate = currencies.find(
    (c) => c.short === baseCurrency
  ).rate;
  currencyList.querySelectorAll(".currencyBox").forEach((curr) => {
    const currencyRate = currencies.find((c) => c.short === curr.id).rate;
    const exchangeRate =
      curr.id === baseCurrency
        ? 1
        : (currencyRate / baseCurrencyRate).toFixed(2);
    curr.querySelector(
      ".rate"
    ).textContent = `1 ${baseCurrency} = ${exchangeRate} ${curr.id}`;
  });
}

currencyList.addEventListener("input", inputChangeBaseCurrency);

function inputChangeBaseCurrency(event) {
  const isNewBaseCurrency = event.target.closest("li").id !== baseCurrency;
  if (isNewBaseCurrency) {
    currencyList
      .querySelector(`#${baseCurrency}`)
      .classList.remove("base-currency");
    setNewBaseCurrency(event.target.closest("li"));
  }
  const newBaseCurrencyAmount = Number(event.target.value);
  if (baseCurrencyAmount !== newBaseCurrencyAmount || isNewBaseCurrency) {
    baseCurrencyAmount = newBaseCurrencyAmount;
    const baseCurrencyRate = currencies.find(
      (c) => c.short === baseCurrency
    ).rate;

    currencyList.querySelectorAll(".currencyBox").forEach((curr) => {
      if (curr.id !== baseCurrency) {
        const currencyRate = currencies.find((c) => c.short === curr.id).rate;
        const exchangeRate =
          curr.id === baseCurrency
            ? 1
            : (currencyRate / baseCurrencyRate).toFixed(2);
        curr.querySelector("input").value =
          exchangeRate * baseCurrencyAmount !== 0
            ? (exchangeRate * baseCurrencyAmount).toFixed(2)
            : "";
      }
    });
  }
}

currencyList.addEventListener("focusout", focusedOut);

function focusedOut(event) {
  const inputValue = event.target.value;
  if (inputValue == 0) event.target.value = "";
  else {
    event.target.value = Number(inputValue).toFixed(2);
  }
}

// SHOW STARTER CURRENCY \\

function starterCurrency() {
  for (let i = 0; i < starters.length; i++) {
    const currency = currencies.find((c) => c.short === starters[i]);
    newCurrenciesListItem(currency);
  }
}

// ADD CURRENCY FROM PICK CURRENCY LIST TO MAIN LIST \\

pickCurrencyList.addEventListener("click", addCurrencyListClick);

function addCurrencyListClick(event) {
  const clickedItem = event.target.closest("li");
  if (!clickedItem.classList.contains("picked")) {
    const newCurrency = currencies.find(
      (c) => c.short === clickedItem.getAttribute("data-currency")
    );
    if (newCurrency) newCurrenciesListItem(newCurrency);
  }
}

// CURRENCY PICKER \\
function newCurrenciesListItem(currency) {
  if (currencyList.childElementCount === 0) {
    baseCurrency = currency.short;
    baseCurrencyAmount = 0;
  }
  pickCurrencyList
    .querySelector(`[data-currency=${currency.short}]`)
    .classList.add("picked");
  const baseCurrencyRate = currencies.find(
    (c) => c.short === baseCurrency
  ).rate;
  const exchangeRate =
    currency.short === baseCurrency ? 1 : currency.rate / baseCurrencyRate;
  const inputValue = baseCurrencyAmount
    ? (baseCurrencyAmount * exchangeRate).toFixed(2)
    : "";

  currencyList.insertAdjacentHTML(
    "beforeend",
    `<li class= "currencyBox ${
      currency.short === baseCurrency ? "base-currency" : ""
    }" id=${currency.short}>
        <img src="${currency.flag}" alt="${currency.currencyName}">
            <div class="info">
                <p class="input"><span>${currency.Symbol}</span>
                <input type="number" placeholder="0.00" value = ${inputValue}></p>
                    <p class="currencyName">${currency.currencyName}</p>
                    <p class="rate">1 ${baseCurrency} = <span class='base-currency-rate'>${exchangeRate}</span> <span id="curName">${
      currency.short
    }</span></p>
                    </div>
                <span class="close">x</span>
                </li>`
  );
}
