# System Context Diagram

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
  Pay[UPI/Razorpay]
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
