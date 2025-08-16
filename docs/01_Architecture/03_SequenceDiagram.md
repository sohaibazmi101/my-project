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
