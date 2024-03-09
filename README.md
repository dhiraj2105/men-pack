# men-pack : MongoDB Express Nodejs - Package

It is a package that can simply Server Developement.

Instead of writing lines of codes developers can use this package to simply connect mongoDB to express server.

## Features

- Connect to MongoDB Database
- Login User

## Usage

### ConnectMongoDB

```js
ConnectToMongoDB("MongoDB URI");
```

### LoginAPI

```js
LoginAPI(LoginRoute, UserModel, server_name);
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

LoginAPI("/login", User, app);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
```

[!TIP]
You can remove bugs/errors from this package or add new features to it [ Github ](https://github.com/dhiraj2105/men-pack)
