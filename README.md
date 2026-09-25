# Dota 2 Heroes Mobile App

A **React Native mobile application** for managing Dota 2 heroes using **CRUD (Create, Read, Update, Delete)** operations.

## 📱 Features

* View Dota 2 heroes
* Add new heroes
* Edit hero information
* Delete heroes
* REST API integration
* YouTube Data API v3 integration
* MySQL database
* Mobile-friendly React Native interface

## 🛠️ Technologies

* React Native
* JavaScript / TypeScript
* PHP
* REST API
* YouTube Data API v3
* MySQL
* Freehostia
* DuckDNS
* Git & GitHub

## 🔗 Third-Party API

This project uses the **YouTube Data API v3** to retrieve YouTube video information related to Dota 2 heroes.

**API URL:**

```text
https://www.googleapis.com/youtube/v3/
```

The API can be used to retrieve:

* YouTube videos
* Video titles
* Video descriptions
* Channel information
* Video thumbnails

> **Note:** An API key is required to access the YouTube Data API v3. Do not upload your API key to GitHub.

## 🏗️ Architecture

```text
React Native App
       │
       ├──────────────► YouTube Data API v3
       │
       ▼
    REST API
       │
       ▼
  MySQL Database
       │
       ▼
   Freehostia
       │
       ▼
     DuckDNS
```

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/dota2-heroes-crud-app.git
cd dota2-heroes-mobile-app
```

Install dependencies:

```bash
npm install
```

Configure your API URL:

```typescript
const API_URL = "https://your-domain.duckdns.org/api";
```

Configure your YouTube API key securely in your project.

Run the application:

```bash
npm start
```

For Android:

```bash
npx react-native run-android
```

## 🌐 Hosting

The backend API is hosted using **Freehostia**, with **DuckDNS** used for domain access.

## 🎯 Purpose

This project was created for educational purposes to demonstrate **React Native, CRUD operations, REST API integration, YouTube Data API v3, MySQL, and web hosting**.

## 📄 License

For educational purposes.

Dota 2 and its related assets are trademarks of their respective owners.
