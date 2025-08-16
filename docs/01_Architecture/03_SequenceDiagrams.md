
---

### **3.3 Sequence Diagram**  
`docs/01_Architecture/03_SequenceDiagrams.md`:

```markdown
# Customer Order Workflow

```mermaid
sequenceDiagram
  actor C as Customer
  participant FE as React App
  participant API as Node/Express
  participant SVC as Order Service
  participant DB as MongoDB
  participant PAY as Razorpay
  participant Email as Brevo

  C->>FE: Click "Place Order"
  FE->>API: POST /orders (with location)
  API->>SVC: validateCart() + distance <= 15km
  SVC->>DB: fetch products, group by shop
  SVC->>Email: send OTP for verification
  alt OTP verified
    SVC->>DB: create orders
    SVC->>PAY: create payment intent
    PAY-->>SVC: payment link/ref
    SVC-->>API: {orderId, paymentRef, payUrl}
    API-->>FE: payUrl
  end
  C->>PAY: complete payment
  PAY-->>API: webhook /payments/confirm
  API->>DB: update order status=PAID
  API-->>FE: notify via polling/websocket
