
---

### **3.2 Container Diagram**  
`docs/01_Architecture/02_ContainerDiagram.md`:

```markdown
# Container Diagram

```mermaid
flowchart TB
  subgraph Browser[Browser]
    SPA[React App\nRoutes: Home, Shop, Product, Cart, Checkout, Customer, Seller, Admin, DeliveryBoy]
  end

  subgraph Server[Backend: Node/Express]
    Auth[Auth Controller\nGoogle Login, JWT Tokens]
    Shop[Shop Controller\nCRUD, Banner Management]
    Product[Product Controller\nCRUD, Multi-Image Upload]
    Cart[Cart Service\nSingle-shop check, Split logic]
    Order[Order Service\nPlaceOrder, Split by shop, Razorpay Webhooks]
    Delivery[Delivery Service\nAssign/track delivery boy]
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
