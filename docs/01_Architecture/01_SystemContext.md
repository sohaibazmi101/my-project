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