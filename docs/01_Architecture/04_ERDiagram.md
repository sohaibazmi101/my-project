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
