const loginButton = document.getElementById('loginButton');
const email = document.getElementById('inputEmail');
const password = document.getElementById('inputPassword');
const name = document.getElementById('inputName');
const errorField = document.getElementById('errorField');
const LOGIN_URL = 'https://homeless-app-backend.herokuapp.com/api/login';
const REGISTER_URL = 'https://homeless-app-backend.herokuapp.com/api/users';
const ITEMS_URL = 'https://homeless-app-backend.herokuapp.com/api/items/';
const ADS_URL = 'https://homeless-app-backend.herokuapp.com/api/ads/';
const USER_URL = 'https://homeless-app-backend.herokuapp.com/api/';

function logInFire() {
  const loginButtonDiv = document.getElementById('loginButtonDiv');
  loginButtonDiv.innerHTML = '<img class="text-center img-rolling" src="img/rolling.svg" />';
  let foundError = false;
  resetLoginErrors();

  if (password.value.length < 3) {
    password.style.borderColor = 'red';
    foundError = true;
  }

  if (email.value.length < 3) {
    email.style.borderColor = 'red';
    foundError = true;
  }

  if (foundError === true) {
    loginButtonDiv.innerHTML = '<button type="button" onClick="logInFire()" class="btn btn-primary login-button" id="loginButton">Login</button>';
    return;
  }

  axios.post(LOGIN_URL, {
    email: email.value,
    password: password.value
  })
    .then(response => {
      if (typeof response.data.err === "undefined") {
        setSessionStorage(response.data);
         window.location.assign("index-logged.html");
      } else {
        errorField.innerHTML = response.data.err;
        loginButtonDiv.innerHTML = '<button type="button" onClick="logInFire()" class="btn btn-primary login-button" id="loginButton">Login</button>';
      }
    })
    .catch(err => {
      errorField.innerHTML = 'Authentication failed';
      console.log(err);
      loginButtonDiv.innerHTML = '<button type="button" onClick="logInFire()" class="btn btn-primary login-button" id="loginButton">Login</button>';
    });
}

function registerFire() {
  const registerButtonDiv = document.getElementById('registerButtonDiv');
  registerButtonDiv.innerHTML = '<img class="text-center img-rolling" src="img/rolling.svg" />';
  let foundError = false;
  resetRegisterErrors();

  if (password.value.length < 3) {
    password.style.borderColor = 'red';
    foundError = true;
  }

  if (email.value.length < 3) {
    email.style.borderColor = 'red';
    foundError = true;
  }

  if (name.value.length < 3) {
    email.style.borderColor = 'red';
    foundError = true;
  }

  if (foundError === true) {
    registerButtonDiv.innerHTML = '<button type="button" class="btn btn-primary login-button" onClick="registerFire()" id="loginButton">Register</button>';
    return;
  }

  axios.post(REGISTER_URL, {
    email: email.value,
    password: password.value,
    name: name.value
  })
    .then(response => {
      if (typeof response.data.email !== "undefined") {
        registerButtonDiv.innerHTML = '<button type="button" class="btn btn-primary login-button" onClick="registerFire()" id="loginButton">Register</button>';
        window.location.assign("index.html");
      } else {
        errorField.innerHTML = 'Register failed';
        registerButtonDiv.innerHTML = '<button type="button" class="btn btn-primary login-button" onClick="registerFire()" id="loginButton">Register</button>';
      }
    })
    .catch(err =>  {
      errorField.innerHTML = 'Register failed';
      registerButtonDiv.innerHTML = '<button type="button" class="btn btn-primary login-button" onClick="registerFire()" id="loginButton">Register</button>';
      console.log(err);
    });
}

function setSessionStorage(user) {
  sessionStorage.setItem("email", user.email);
  sessionStorage.setItem("name", user.name);
  sessionStorage.setItem("id", user._id);
}

function resetLoginErrors() {
  email.style.borderColor = '#ced4da';
  password.style.borderColor = '#ced4da';
  errorField.innerHTML = '';
}

function resetRegisterErrors() {
  name.style.borderColor = '#ced4da';
  email.style.borderColor = '#ced4da';
  password.style.borderColor = '#ced4da';
  errorField.innerHTML = '';
}

function ensureAuthentication() {
  const user_email = sessionStorage.getItem("email");
  const user_name = sessionStorage.getItem("name");
  const user_id = sessionStorage.getItem("id");

  if (user_email === null && user_name === null && user_id === null) {
    window.location.assign("index.html");
  }
}

function ensureAuthenticationAndGetUserItems() {
  ensureAuthentication();
  getUserItems();
}

function ensureAuthenticationAndLoadStatistics() {
  ensureAuthentication();
  getUserStatistics();
}

function getUserItems() {
  const container = document.getElementById('items');
  container.innerHTML = '<img class="text-center img-rolling" src="img/rolling.svg" />';
  const user_id = sessionStorage.getItem("id");

  axios.get(`${ITEMS_URL}${user_id}`)
    .then((response) => {
      if (response.data.length === 0) {
        return returnEmptyUserItems();
      }
      return returnUserItems(response.data);
    })
    .catch(err => console.log(err));
}

function getUserStatistics() {
  const container = document.getElementById('statistics');
  container.innerHTML = '<img class="text-center img-rolling" src="img/rolling.svg" />';
  const user_id = sessionStorage.getItem("id");

  axios.get(`${USER_URL}${user_id}`)
    .then((response) => {
      return returnUserStatistics(response.data);
    })
    .catch(err => console.log(err));
}

function returnEmptyUserItems() {
  const container = document.getElementById('items');
   container.innerHTML = `
    <div class="jumbotron">
      <p class="text-center">Couldn´t find any bought items.</p>
    </div>
  `;
}

function returnUserItems(items) {
  const container = document.getElementById('items');
  let userItems = '';

  function compare(a,b) {
  if (a.date > b.date)
    return -1;
  if (a.date < b.date)
    return 1;
  return 0;
  }

  items.sort(compare);

  items.map((item) => {
    const days = item.date.substring(8, 10);
    const months = item.date.substring(5, 7);
    const year = item.date.substring(0, 4);
    userItems += `
      <div class="jumbotron">
        <p class="text-center">Date: ${days}.${months}.${year}</p>
        <p class="text-center">Name: ${item.name}</p>
        <p class="text-center">Price: ${item.price}£</p>
      </div>
    `
  });
  container.innerHTML = userItems;
}

function returnUserStatistics(user) {
  const container = document.getElementById('statistics');
  let itemsPriceTotal = 0;
  const adsMoneyMade = (user.countads * 0.01).toFixed(2);
  const itemsTotalBought = user.items.length;

  user.items.map((item) => {
    return itemsPriceTotal += item.price;
  });

  container.innerHTML = `
    <div class="jumbotron">
      <p class="text-center">Statistics</p>
      <p class="text-center">Name: ${user.name}</p>
      <p class="text-center">Total Items Bought: ${itemsTotalBought}</p>
      <p class="text-center">Total Items Value: £${itemsPriceTotal}</p>
      <p class="text-center">Money Donated From Ads: £${adsMoneyMade}</p>
    </div>
  `;
}

function logOut() {
  sessionStorage.removeItem("email");
  sessionStorage.removeItem("name");
  sessionStorage.removeItem("id");
  window.location.assign("index.html");
}

function adsFire() {
  const user_id = sessionStorage.getItem("id");

  axios.put(`${ADS_URL}${user_id}`)
    .then((response) => {
      console.log('watched ad');
    })
    .catch(err => console.log(err));
}

function mealFire() {
  sessionStorage.setItem("item.name", 'Meal');
  sessionStorage.setItem("item.price", '6');
  paymentModal();
}

function blanketFire() {
  sessionStorage.setItem("item.name", 'Blanket');
  sessionStorage.setItem("item.price", '15');
  paymentModal();
}

function paymentModal() {
  const modalbody = document.getElementById('modal-body');

  modalbody.innerHTML = `
        <form role="form" id="payment-form" method="POST" action="javascript:void(0);">
            <div class="row">
                <div class="col-xs-12">
                    <div class="form-group">
                        <label for="cardNumber">CARD NUMBER</label>
                        <div class="input-group">
                            <input
                                type="tel"
                                class="form-control"
                                name="cardNumber"
                                placeholder="Valid Card Number"
                                autocomplete="cc-number"
                                required autofocus
                            />
                            <span class="input-group-addon"><i class="fa fa-credit-card"></i></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-7 col-md-7">
                    <div class="form-group">
                        <label for="cardExpiry"><span class="hidden-xs">EXPIRATION</span><span class="visible-xs-inline">EXP</span> DATE</label>
                        <input
                            type="tel"
                            class="form-control"
                            name="cardExpiry"
                            placeholder="MM / YY"
                            autocomplete="cc-exp"
                            required
                        />
                    </div>
                </div>
                <div class="col-xs-5 col-md-5 pull-right">
                    <div class="form-group">
                        <label for="cardCVC">CV CODE</label>
                        <input
                            type="tel"
                            class="form-control"
                            name="cardCVC"
                            placeholder="CVC"
                            autocomplete="cc-csc"
                            required
                        />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-12">
                    <button class="btn btn-success btn-lg btn-block" onClick="buyItem()" type="button">Pay ${sessionStorage.getItem("item.price")} £</button>
                </div>
            </div>
        </form>
  `;
}

function buyItem() {
  const itemProps = {
    name: sessionStorage.getItem("item.name"),
    price: sessionStorage.getItem("item.price")
  };

  axios.post(`${ITEMS_URL}${sessionStorage.getItem("id")}`, itemProps)
    .then((result) => {
      if (result.data.name === itemProps.name) {
        window.location.assign("bought-items.html");
      } else {
        console.log('Payment didn´t happen');
      }
    })
    .catch(err => console.log(err));
}
