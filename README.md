# Hurry Cart

**Hurry Cart** is an **online local marketplace** connecting nearby sellers and customers.  
It supports multi-shop orders, delivery boy tracking, OTP verification, and location-based shopping (15 km radius).  

---

## Features
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

##  Folder Structure


- ### **Documentation**


`docs/
- 01_Architecture/ 
 ----->01_SystemContext.md, 
 ----->02_ContainerDiagram.md, 
 ----->03_SequenceDiagram.md,
 ----->04_ERDiagram.md,
- 02_API/ 
 -----> [01_AuthAPI.md,
 ----->02_ProductAPI.md,
 ----->03_ShopAPI.md,
 ----->04_OrderAPI.md, 
 ----->05_DeliveryAPI.md], 
- 03_OtherDocs/ 
 ----->[01_Features.md, 
 ----->02_Technologies.md, 
 ----->03_Deployment.md, 
 ----->04_Usage.md]`


---

##  Technologies Used
- **Frontend**: React, Bootstrap, React Router, React Icons, React Leaflet  
- **Backend**: Node.js, Express.js, Mongoose  
- **Database**: MongoDB Atlas  
- **Authentication**: Google OAuth for customers  
- **Payments**: Razorpay with webhook support  
- **Email/OTP**: Brevo (formerly Sendinblue)  
- **Image Hosting**: Cloudinary  

---

##  Diagrams

# System Context Diagram

```mermaid
flowchart LR
  Customer((Customer)) -->|Browse, Order, Pay| FE[Frontend: React App]
  Seller((Seller)) -->|Manage Shop & Products| FE
  DeliveryBoy((Delivery Boy)) -->|Update Delivery Status| FE
  Admin((Admin)) -->|Manage Categories & Monitor| FE

  FE -->|API Calls| BE[Backend: Node/Express API]

  BE -->|Store Data| DB[(MongoDB Atlas)]
  BE -->|Store Images| Cloud[(Cloudinary)]
  BE -->|Payment Processing| Razorpay[(Razorpay API)]
  BE -->|Send OTP Email| Brevo[(Brevo API)]


# Container Diagram

This diagram shows all major containers in **Har Cheez Now**, how they interact, and third-party integrations.

```mermaid
flowchart TB
  %% ===== Browser / Frontend =====
  subgraph Browser
    SPA["React SPA - Routes: Home, Shop, Product, Cart, Checkout, Customer, Seller, Admin, DeliveryBoy"]
  end

  %% ===== Backend =====
  subgraph Server
    Auth["Auth Controller: Google OAuth, JWT Tokens"]
    Shop["Shop Controller: CRUD Shops, Banner Management"]
    Product["Product Controller: CRUD Products, Multi-Image Upload"]
    Cart["Cart Service: Single-shop check, Split logic"]
    Order["Order Service: Place Orders, Split by Shop, Razorpay Webhooks"]
    Delivery["Delivery Service: Assign / Track Delivery Boy"]
    CustomerService["Customer Service: Profile, Recently Viewed, Location Verification"]
  end

  %% ===== Data Stores =====
  subgraph Data
    Mongo["MongoDB Atlas"]
    Cloud["Cloudinary"]
  end

  %% ===== Third Party Integrations =====
  subgraph Integrations
    GoogleOAuth["Google OAuth"]
    Razorpay["Razorpay API"]
    Brevo["Brevo API"]
  end

  %% ===== Connections =====
  SPA <--> Auth
  SPA <--> Product
  SPA <--> Shop
  SPA <--> Cart
  SPA <--> Order
  SPA <--> Delivery
  SPA <--> CustomerService

  Auth <--> Mongo
  Shop <--> Mongo
  Product <--> Mongo
  Cart <--> Mongo
  Order <--> Mongo
  Delivery <--> Mongo
  CustomerService <--> Mongo
  Product <--> Cloud

  Auth <--> GoogleOAuth
  Order <--> Razorpay
  CustomerService <--> Brevo


# Sequence Diagram

This diagram shows the sequence of interactions when a customer places an order in **Har Cheez Now**.

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Frontend (React SPA)
    participant BE as Backend (Node/Express)
    participant DB as MongoDB Atlas
    participant P as Razorpay
    participant E as Brevo OTP

    C->>FE: Browse products & add to cart
    C->>FE: Click Checkout
    FE->>BE: /placeOrder with cart & location
    BE->>DB: Validate shop distances (<= 15 km)
    BE->>E: Send OTP email
    E-->>C: Deliver OTP
    C->>FE: Enter OTP
    FE->>BE: Verify OTP
    BE->>P: Create Payment Order
    P-->>BE: Payment Success Webhook
    BE->>DB: Save order(s), split by shop
    BE-->>FE: Return Order Confirmation
    FE-->>C: Show Confirmation + Google Map link


# ER Diagram

This diagram shows the database structure and relationships for **Har Cheez Now**.

```mermaid
erDiagram
    CUSTOMER {
        string _id PK
        string name
        string email
        string location
    }
    SELLER {
        string _id PK
        string shopName
        string bannerImage
        string userId FK
    }
    SHOP {
        string _id PK
        string name
        string sellerId FK
        string description
    }
    PRODUCT {
        string _id PK
        string name
        number price
        string[] images
        string shopId FK
    }
    ORDER {
        string _id PK
        string customerId FK
        string shopId FK
        date orderDate
        string status
    }
    DELIVERY {
        string _id PK
        string orderId FK
        string deliveryBoyId FK
        string status
    }
    DELIVERYBOY {
        string _id PK
        string name
        string phone
    }

    CUSTOMER ||--o{ ORDER : places
    SELLER ||--o{ SHOP : owns
    SHOP ||--o{ PRODUCT : contains
    SHOP ||--o{ ORDER : receives
    ORDER ||--o{ DELIVERY : assigned_to
    DELIVERYBOY ||--o{ DELIVERY : handles
