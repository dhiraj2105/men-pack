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

1. **Environment Management**

- Automatically handles `.env` file configurations.

3. **Routing & Controllers**

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

* **MongoDB Integration**
  - Easy MongoDB connection setup.
  - Out-of-the-box support for environment-based configurations.
* **Authentication APIs**
  - Pre-built login and signup APIs with JWT-based authentication.
* **Middleware Support**
  - Common middlewares like CORS, body parsing, and request logging.

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
men-pack generate
```

You will be prompted to:- Choose between Components and TypeScript or JavaScript.

### **Environment Management**

MEN-Pack supports `.env` files for storing sensitive data. Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db-name>
JWT_SECRET=your_secret_key
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

## **Contact**

For questions, feedback, or issues, reach out at:

- GitHub Issues: [https://github.com/dhiraj2105/men-pack](https://github.com/dhiraj2105/men-pack)
- npm Package: [https://www.npmjs.com/package/men-pack](https://www.npmjs.com/package/men-pack)

---

Start building your backend projects faster and better with MEN-Pack today!
