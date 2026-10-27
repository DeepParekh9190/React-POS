# 🧾 React POS — offline-first point of sale

A production-style point-of-sale PWA for a shop counter: ring up sales, scan barcodes, print GST invoices and keep the till working when the internet drops.

**[Live demo →](https://react-pos-gamma.vercel.app)** · [Report a bug](https://github.com/DeepParekh9190/React-POS/issues)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![No UI library](https://img.shields.io/badge/CSS-handwritten-informational)

---

## Why

Most POS demos assume a perfect network and a backend. A real counter does not: the connection drops mid-sale, the owner needs the day's takings on paper, and staff should not be able to open the admin panel. This one is built around those constraints — everything lives in the browser, installs as an app, and prints a GST invoice.

## Features

- **Product catalog** — grid with search, category filters and quick-add.
- **Cart** — quantity stepper, remove, live subtotal / tax / total.
- **Quick sell bar** — keyboard-friendly path for fast counter input.
- **Barcode scanning** — camera-based scanning to pull a product straight into the cart.
- **GST invoice** — printable tax invoice generated from the order.
- **Customers & order history** — saved customers, past orders, re-open a bill.
- **Admin panel** — product and stock management behind a login.
- **Employee login + biometric gate** — WebAuthn/PIN-style lock so the till can't be opened by anyone walking past.
- **Backup / restore** — export and re-import all local data as a file.
- **Installable PWA** — offline-first, add to home screen, works without a connection.

## Stack

React 18 · Vite 6 · vanilla CSS (no component library) · `vite-plugin-pwa` · browser storage, no backend.

State is local component/context state; the data layer is `localStorage` behind small helpers so it can be swapped for an API later.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview the build (PWA install prompt works here)
```

## Structure

```
src/components/    one folder-level component per feature (Cart, CheckoutModal,
                   BarcodeScanner, GSTInvoice, AdminPanel, CustomerManager,
                   OrderHistory, EmployeeLogin, BiometricGate, BackupRestore)
src/App.jsx        shell + routing between till and admin
public/            PWA icons
```

## What I'd improve next

- Move storage behind an interface and add an optional Node/Supabase sync so multiple tills share one catalog.
- Add automated tests for the cart/tax maths — currently the highest-risk untested code.
- Split `App.jsx` routing into React Router once a third screen lands.
