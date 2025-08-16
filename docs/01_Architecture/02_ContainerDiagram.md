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