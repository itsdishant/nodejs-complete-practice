# Node.js Practice Projects

A collection of hands-on practice projects exploring Node.js from core runtime
fundamentals to full-stack MVC web applications.

## Projects & Practice Modules

| Directory | Description |
| --- | --- |
| [`airbnb`](./airbnb) | Full-stack Airbnb clone using Express 5, Mongoose 9, MongoDB session store, EJS, and Tailwind CSS v4. Features role-based auth, property listings, reservations, and wishlists. |
| [`airbnb-node-mongodb`](./airbnb-node-mongodb) | Airbnb implementation built with the native [MongoDB](https://www.mongodb.com/) Node.js driver for direct collection operations without an ODM. |
| [`airbnb-node-mongoose`](./airbnb-node-mongoose) | Airbnb implementation using [Mongoose](https://mongoosejs.com/) for schema modeling, validation, and relational population. |
| [`airbnb-node-mysql`](./airbnb-node-mysql) | Airbnb implementation backed by a relational database using [MySQL](https://www.mysql.com/) (`mysql2`) and SQL queries. |
| [`calculator`](./calculator) | Vanilla Node.js HTTP server implementing basic arithmetic calculations through request parsing. |
| [`error-debugging`](./error-debugging) | Node.js debugging and error-handling exercises covering runtime diagnostics, call stacks, and debugger tools. |
| [`express-intro`](./express-intro) | Introduction to Express.js covering middleware pipelines, routing, and template rendering basics. |
| [`route`](./route) | Core Node.js HTTP routing practice without third-party frameworks using `req.url` and `req.method`. |
| [`streams`](./streams) | Core Node.js streams and buffers practice demonstrating chunk-based file reading and writing. |

## Getting Started

Each directory is a standalone project. To run any project:

1. Navigate to the project folder:

   ```bash
   cd <folder-name>
   ```

2. Install dependencies (if `package.json` is present):

   ```bash
   npm install
   ```

3. Start the application:

   ```bash
   npm start
   # or
   node index.js
   ```
