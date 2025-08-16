# Har Cheez Now

## 1️⃣ Project Overview

**Goal:**  
"Har Cheez Now" is an online local marketplace connecting customers with sellers, supporting multi-shop orders, delivery boy management, and location-based order restrictions within 15 km.

**Special Features:**  
- Google OAuth login for customers  
- Multi-shop cart splitting  
- Customer location verification using Google Maps  
- Razorpay payment integration + webhook support  
- Email OTP verification via Brevo  
- Cloudinary for images (products, shop banners)  

**Hosting:**  
- Frontend: Netlify  
- Backend: Render  
- Database: MongoDB Atlas  

---

## 2️⃣ User Roles & Access

| Role          | Access / Description                                                                 |
|---------------|-------------------------------------------------------------------------------------|
| Customer      | Browse shops/products, place orders, view order history, update profile             |
| Seller        | Manage shop, products, delivery boys, view orders                                   |
| Admin         | Manage categories, featured products, offers, top sellers, KYC, all orders          |
| Delivery Boy  | Login, view assigned orders, update delivery status                                 |

**Notes:**  
- Customer orders restricted to ≤15 km radius.  
- OTP verification for order placement prevents bots.  
- JWT-based authentication and role-based route protection.  

---

## 3️⃣ Architecture Diagrams

### **3.1 System Context**

```mermaid
flowchart LR
  Customer[Customer 👤]
  Seller[Seller 👤]
  Admin[Admin 👤]
  DeliveryBoy[Delivery Boy 👤]

  subgraph System[Har Cheez Now]
    FE[React + Bootstrap SPA]
    BE[Node/Express API]
    DB[(MongoDB Atlas)]
  end

  Google[Google OAuth]
  Pay[Razorpay]
  Cloud[Cloudinary]
  Brevo[Brevo Email OTP]

  Customer --> FE
  Seller --> FE
  Admin --> FE
  DeliveryBoy --> FE
  FE <---> BE
  BE <---> DB
  BE <---> Pay
  BE <---> Google
  BE <---> Cloud
  BE --> Brevo
