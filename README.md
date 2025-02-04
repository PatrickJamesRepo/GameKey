# GameKey Web3 Login - Password-less, Secure Authentication

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
  <img src="Gamekey.png" alt="GameKey" style="width: 45%;"/>
  <img src="Gamekey1.png" alt="Step 1" style="width: 45%;"/>
  <img src="../../../../../media/patrick/PHILIPS%20SSD/IntelleJProjects/Portfolio/src/main/resources/static/images/Gamekey2.png" alt="Step 2" style="width: 45%;"/>
  <img src="Gamekey3.png" alt="Step 3" style="width: 45%;"/>
</div>

GameKey Web3 Login offers a **secure, password-less authentication system** leveraging the **Cardano blockchain**. With GameKey, users authenticate using their **Cardano wallet’s cryptographic signature**, eliminating the need for usernames and passwords while ensuring **maximum security**.

This solution is designed for **dApps, gaming platforms, DAOs, marketplaces**, and any Web3-based application requiring **seamless authentication**. GameKey enables **wallet-based authentication** while maintaining **user privacy and decentralization**. In addition, it supports **asset display**, **PCS login**, and **token gating** for access control.



## Key Features

- **Decentralized Identity (DID):** Authenticate users securely via cryptographic wallet signatures.
- **Stateless JWT Authentication:** No session storage required, making it highly **scalable**.
- **Cardano Blockchain Integration:**
    - **Token-Gating:** Restrict access to content based on wallet holdings.
    - **ADA Handle Support:** Verify addresses through ADA Handles.
    - **PCS Collection Support:** Login via **PCS collections** or **ADA handles**.
    - **UTXO & Asset Management:** Fetch wallet assets for interaction with smart contracts.
- **Privacy-Centric:** No personal information is stored, ensuring compliance with Web3 principles.
- **Multi-Platform Support:** Works across **gaming**, **marketplaces**, **DAOs**, and **DeFi applications**.
- **Asset Display & Interaction:** Fetch and display assets from a wallet, allowing interaction within the dApp.


## Installation

### Prerequisites

Make sure you have the following installed before getting started:

- **Java JDK 17+** (for the backend)
- **Node.js & npm** (for frontend development)
- **Maven** (for building the backend)
- **PostgreSQL** *(optional, for database persistence)*

### Backend Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/PatrickJamesRepo/GameKey
   cd GameKey
