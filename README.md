# MEN-Pack

**MEN-Pack** is a powerful npm package that simplifies backend development in Node.js by providing ready-to-use tools and boilerplates for projects. Built with scalability, ease of use, and modern best practices in mind, MEN-Pack enables developers to quickly set up and manage projects using MongoDB, Express, and Node.js, along with a CLI tool to automate repetitive tasks.

[ I am rewriting the whole package so for now only CLI is working, but i am working on it and it will be available for ou use ASAP. ]

---

## **Motive**

Building a backend from scratch for every project can be time-consuming and repetitive. MEN-Pack aims to:

- Save development time by automating common backend tasks.
- Help beginners and professionals alike with a structured starting point.
- Provide developers with the flexibility to choose between TypeScript or JavaScript.
- Enable faster prototyping with boilerplate code generation for routes, models, and controllers.
- Promote scalable and modern development practices.

---

## **Features**

### **Core Features**

1. **MongoDB Integration**

   - Easy MongoDB connection setup.
   - Out-of-the-box support for environment-based configurations.

2. **Authentication APIs**

   - Pre-built login and signup APIs with JWT-based authentication.

3. **Middleware Support**

   - Common middlewares like CORS, body parsing, and request logging.

4. **Environment Management**

   - Automatically handles `.env` file configurations.

5. **Routing & Controllers**

   - Generates modular routes and controllers to keep your project structured.

### **CLI Tool**

The CLI tool takes automation to the next level, allowing you to:

- **Initialize projects**:
  - Choose between TypeScript or JavaScript.
  - Auto-generate `package.json`, folder structure, and essential configuration files.
- **Generate boilerplate code**:
  - Create models, routes, and controllers with just a single command.
  - Automatically connect routes and controllers.
- **Build & Deploy**:
  - Run build and deployment commands with ease.

### **Upcoming Features**

- **Database Integrations**:
  - Support for PostgreSQL and MySQL.
- **Advanced Authentication**:
  - OAuth and social login support.
- **Scaffold Full Projects**:
  - Generate backend projects with pre-defined setups for common use cases.
- **Custom Middlewares**:
  - Extendable middleware templates for validation, caching, etc.
- **Plugins**:
  - Extend MEN-Pack's functionality with custom plugins.

---

## **Installation**

Install MEN-Pack globally to access its CLI tool:

```bash
npm install -g men-pack
```

---

## **Usage**

### **Initialize a New Project**

Run the following command to start a new backend project:

```bash
men-pack init
```

- You will be prompted to:
  - Choose between TypeScript or JavaScript.
  - Provide the project name.
  - Configure MongoDB connection.

This will create a fully functional backend boilerplate with the chosen configurations.

### **Generate Code**

#### Create a New Route:

```bash
men-pack generate route <route-name>
```

This will:

- Create a new route in the `routes/` folder.
- Generate a corresponding controller in the `controllers/` folder.
- Connect the route and controller automatically.

#### Create a New Model:

```bash
men-pack generate model <model-name>
```

This will:

- Create a schema in the `models/` folder.
- Generate basic CRUD operations in the respective controller.

### **Environment Management**

MEN-Pack supports `.env` files for storing sensitive data. Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db-name>
JWT_SECRET=your_secret_key
```

---

## **Development Commands**

MEN-Pack provides several pre-configured commands to help with development and production:

- **Build**: Transpile TypeScript files to JavaScript.

  ```bash
  npm run build
  ```

- **Start**: Start the server in production mode.

  ```bash
  npm start
  ```

- **Dev**: Run the server in development mode with live-reloading.

  ```bash
  npm run dev
  ```

- **Test**: Run tests.

  ```bash
  npm test
  ```

---

## **Folder Structure**

```text
src/
  controllers/   # Controller files for business logic
  models/        # Mongoose models
  routes/        # API routes
  middlewares/   # Custom middlewares
  config/        # Configuration files (DB, env)
  utils/         # Helper functions
  index.ts       # Entry point

dist/             # Compiled JavaScript files (ignored in GitHub)
.env               # Environment variables (ignored in GitHub)
.gitignore         # Git ignore file
package.json       # npm package configuration
README.md          # Documentation
```

---

## **Contributing**

We welcome contributions to MEN-Pack! Feel free to:

- Report bugs.
- Request features.
- Create pull requests.

### Steps to Contribute:

1. Fork the repository on GitHub.
2. Clone your forked repo:
   ```bash
   git clone <repo-url>
   ```
3. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
4. Push to your fork and create a pull request.

---

## **License**

MEN-Pack is licensed under the [MIT License](LICENSE).

---

## **Contact**

For questions, feedback, or issues, reach out at:

- GitHub Issues: [https://github.com/your-repo](https://github.com/your-repo)
- npm Package: [https://www.npmjs.com/package/men-pack](https://www.npmjs.com/package/men-pack)

---

Start building your backend projects faster and better with MEN-Pack today!
