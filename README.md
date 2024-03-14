# men-pack : MongoDB Express Nodejs - Package

It is a package that can simplfy Server Developement.

Instead of writing lines of codes developers can use this package to simply connect mongoDB to express server.

## Features

- Connect to MongoDB Database
- Login User
- Register User

## Usage

### ConnectMongoDB

```js
ConnectToMongoDB("MongoDB URI");
```

### LoginAPI

```js
app.post(LoginRoute, LoginAPI(User, onLoginSuccess));
```

Example

```js
import Express from "express";
import { ConnectMongoDB, LoginAPI } from "men-pack";
import User from "./usermodel.js";
import bodyParser from "body-parser";

const app = Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

ConnectMongoDB("MONGOURI");

const onLogin = (req, res) => {
  res.status(200).json({ message: "Login Done, Redirect to home..." });
  // You can navigate to any page after login
};
app.post("/login", LoginAPI(User, onLogin));
// or you can pass page name as a parameter
app.post("/login", LoginAPI(User, "/home"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
```

### RegisterAPI

```js
app.post(RegisterRoute, RegisterAPI(User, OnRegisterSuccess));
```

Example

```js
import Express from "express";
import { ConnectMongoDB, RegisterAPI } from "men-pack";
import User from "./usermodel.js";
import bodyParser from "body-parser";

const app = Express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

ConnectMongoDB("MONGOURI");

const onRegisterSuccess = (req, res) => {
  res.status(200).json({ message: "Register Done, Redirect to home..." });
  // You can navigate to any page after registration
};
app.post("/register", RegisterAPI(User, onRegisterSuccess));
// or you can just pass page name as a parameter
app.post("/register", RegisterAPI(User, "/home"));

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
```

[!IMPORTANT]
You can remove bugs/errors from this package or add new features to it
[ Github ](https://github.com/dhiraj2105/men-pack)

[ NPM ](https://www.npmjs.com/package/men-pack)
