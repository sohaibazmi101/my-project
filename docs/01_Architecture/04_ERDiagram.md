
---

### **3.4 ER Diagram**  
`docs/01_Architecture/04_ERDiagram.md`:

```markdown
# MongoDB Data Model

```mermaid
erDiagram
  CUSTOMER ||--o{ ORDER : places
  SHOP ||--o{ PRODUCT : owns
  SHOP ||--o{ ORDER : receives
  ORDER ||--o{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : appears_in
  CUSTOMER {
    string _id
    string googleId
    string name
    string email
    string location
    date createdAt
  }
  SHOP {
    string _id
    string seller
    string name
    string bannerUrl
    string description
    string location
  }
  PRODUCT {
    string _id
    string shop
    string title
    number price
    string[] images
    string category
  }
  ORDER {
    string _id
    string customer
    string shop
    string status "PLACED|PAID|SHIPPED|DELIVERED|CANCELLED"
    number total
    string paymentRef
    date createdAt
  }
  ORDER_ITEM {
    string product
    number quantity
    number priceAtPurchase
  }
