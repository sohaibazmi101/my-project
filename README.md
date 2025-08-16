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







