# Offline-First Tuckshop POS System (Beta)

A lightweight, mobile-friendly Point of Sale system designed for informal retail environments with unreliable internet connectivity.

Built specifically for spaza and tuckshop owners in South Africa.

---

## 🚀 Key Features

- 📷 Barcode scanning using mobile camera  
- 🔎 Fast item search and pricing  
- 💰 Automatic markup-based pricing  
- 💵 Cash handling with change calculation  
- 📦 Stock management (add/edit items)  
- 📊 Daily sales tracking  
- 🧾 Recent transactions log  
- 📡 Offline-first operation with local persistence  
- ☁️ Automatic sync to cloud (Google Sheets backend)  

---

## 🧠 Technical Highlights

This project focuses on solving real-world constraints in low-connectivity environments:

- **Offline-first architecture**  
  - Transactions continue without internet  
  - Data stored locally using browser storage  

- **Deferred synchronization**  
  - Sales and stock updates sync when connectivity returns  
  - Prevents data loss in unstable networks  

- **Lightweight backend using Google Apps Script**  
  - Acts as an API layer  
  - Persists data to Google Sheets  

- **Stock consistency tracking**  
  - Updates inventory based on sales  
  - Maintains a simple but effective data model  

---

## 🏗️ Architecture Overview

```
[ Web App (Frontend - Netlify/GitHub Pages) ]
                ↓
     [ Local Storage (Offline Mode) ]
                ↓
     [ Sync Layer (When Online) ]
                ↓
 [ Google Apps Script API ]
                ↓
     [ Google Sheets Database ]
```

---

## 🎯 Real-World Use Case

Designed for small retail shops where:
- Internet access is intermittent or unreliable  
- Low-cost devices (phones) are used for sales  
- Simple, reliable tools are preferred over complex systems  

---

## 📱 How to Use (for Shop Owners)

1. Open on your phone:  
   https://yourusername.github.io/tuckshop-pos-beta/

2. Go to **Settings**

3. Tap **"Create New Shared Sheet for Me"**  
   *(or paste your own Google Sheet URL)*

4. Set sharing to:  
   **"Anyone with the link" → Editor**

5. Paste the sheet URL into the app and sync

6. Start selling!

---

## ⚠️ Beta Status

This is an early version under active development.

### Planned Improvements
- Sync status indicator  
- Enhanced reporting (daily/weekly summaries)  
- Improved stock analytics  
- Better error handling during sync  

---

## 💬 Feedback

Looking for real-world feedback from shop owners:

- What works well?  
- What is confusing?  
- What features are needed?  

---

## 👨‍💻 About the Developer

Self-taught developer with a background in mechanical engineering, focused on building practical tools that solve real operational problems.
