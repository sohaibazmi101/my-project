# Har Cheez Now

**Har Cheez Now** is an **online local marketplace** connecting nearby sellers and customers.  
It supports multi-shop orders, delivery boy tracking, OTP verification, and location-based shopping (15 km radius).  

---

## 🚀 Features
- **Customer Authentication** via Google OAuth  
- **Seller Dashboard** with product & shop management  
- **Delivery Boy Dashboard** with assigned orders & tracking  
- **Location-based Orders**: Customers must allow location; orders restricted to 15km range  
- **OTP Verification**: Brevo (formerly Sendinblue) used during checkout to prevent bot attacks  
- **Payments** via Razorpay with Webhook handling  
- **Image Uploads** via Cloudinary  
- **Recently Viewed Products** tracking  
- **Frontend**: React (deployed on **Netlify**)  
- **Backend**: Node.js/Express (deployed on **Render**)  
- **Database**: MongoDB Atlas  

---

# 🏗 Architecture Diagrams

## 1. System Context Diagram
```mermaid
flowchart LR
  Customer((Customer)) -->|Browse, Order, Pay| FE[Frontend: React App]
  Seller((Seller)) -->|Manage Shop & Products| FE
  DeliveryBoy((Delivery Boy)) -->|Update Delivery Status| FE
  Admin((Admin)) -->|Manage Categories, Monitor| FE

  FE -->|API Calls| BE[Backend: Node/Express API]

  BE -->|Data| DB[(MongoDB Atlas)]
  BE -->|Store Images| Cloud[Cloudinary]
  BE -->|Payment| Razorpay[Razorpay API]
  BE -->|OTP Email| Brevo[Brevo API]


flowchart TB
  subgraph Browser[Browser]
    SPA[React App<br/>Routes: Home, Shop, Product, Cart, Checkout, Customer, Seller, Admin, DeliveryBoy]
  end

  subgraph Server[Backend: Node/Express]
    Auth[Auth Controller<br/>Google Login, JWT Tokens]
    Shop[Shop Controller<br/>CRUD, Banner Management]
    Product[Product Controller<br/>CRUD, Multi-Image Upload]
    Cart[Cart Service<br/>Single-shop check, Split logic]
    Order[Order Service<br/>PlaceOrder, Split by shop, Razorpay Webhooks]
    Delivery[Delivery Service<br/>Assign/track delivery boy]
    Recent[Recently Viewed Service]
  end

  subgraph Data[Data Stores]
    Mongo[(MongoDB Atlas)]
    Cloud[Cloudinary]
  end

  subgraph Integrations[3rd Party]
    OAuth[Google OAuth]
    Payment[Razorpay]
    Email[Brevo OTP]
  end

  SPA <--> Auth
  SPA <--> Product
  SPA <--> Shop
  SPA <--> Cart
  SPA <--> Order
  SPA <--> Delivery

  Auth <--> Mongo
  Shop <--> Mongo
  Product <--> Mongo
  Cart <--> Mongo
  Order <--> Mongo
  Delivery <--> Mongo
  Product <--> Cloud
  Auth <--> OAuth
  Order <--> Payment
  Order --> Email


sequenceDiagram
  participant C as Customer
  participant FE as Frontend (React)
  participant BE as Backend (Node/Express)
  participant DB as MongoDB Atlas
  participant P as Razorpay
  participant E as Brevo OTP

  C->>FE: Place Order (Cart Checkout)
  FE->>BE: /placeOrder with cart, location
  BE->>DB: Validate shop distance (<=15 km)
  BE->>E: Send OTP Email
  E-->>C: Deliver OTP
  C->>FE: Enter OTP
  FE->>BE: Verify OTP
  BE->>P: Create Payment Order
  P-->>BE: Payment Success Webhook
  BE->>DB: Save Order (split by shop)
  BE-->>FE: Order Confirmation
  FE-->>C: Show Confirmation + Map Link


erDiagram
  CUSTOMER {
    string id
    string name
    string email
    string location
  }
  SELLER {
    string id
    string shopName
    string bannerImage
  }
  SHOP {
    string id
    string name
    string sellerId
    string description
  }
  PRODUCT {
    string id
    string name
    number price
    string[] images
    string shopId
  }
  ORDER {
    string id
    string customerId
    string shopId
    date date
    string status
  }
  DELIVERY {
    string id
    string orderId
    string deliveryBoyId
    string status
  }
  DELIVERYBOY {
    string id
    string name
    string phone
  }

  CUSTOMER ||--o{ ORDER : places
  SELLER ||--o{ SHOP : owns
  SHOP ||--o{ PRODUCT : contains
  SHOP ||--o{ ORDER : receives
  ORDER ||--o{ DELIVERY : assigned_to
  DELIVERYBOY ||--o{ DELIVERY : handles


