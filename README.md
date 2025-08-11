<p align="center">
  <a href="https://drop-to.me" target="_blank">
    <img src="https://drop-to.me/favicon.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">
  <a href="https://drop-to.me/">Drop-to.me</a>
</h1>

# Project Overview

DropToMe is an application divided into two main parts: a **backend** and a **frontend**.

- **Backend**: Developed in **TypeScript** using the **NestJS** framework, it handles the application's business logic. It uses **PostgreSQL** to store metrics (number of connections, transfers, etc.) and **Redis** for temporary message data management.
- **Frontend**: Built with **Next.js** (based on React) in **TypeScript**, it provides the user interface and communicates with the backend via an API.

---

### Getting Started

To run the application, you need to configure the necessary environment variables for both the backend and frontend.

- **Configuration**: Copy the `.env.example` files to `.env` in both the `backend` and `frontend` folders and fill in the appropriate values, particularly the database and API URLs.
- **Installation**: Run `npm install` in each folder to install dependencies.
- **Running**: Use `npm run dev` to start both parts of the project in development mode.

For more detailed instructions on installation, environment variable configuration, and deployment options (including **Docker**), please refer to the full README files:

- [Backend README](https://github.com/votre-utilisateur/votre-projet/blob/main/backend/README.md)
- [Frontend README](https://github.com/votre-utilisateur/votre-projet/blob/main/frontend/README.md)
