# Live-Bid Proposal

## Auth

### Signup
1. username(unique-id)
2. email/phone-number
3. password
4. name

- Create a wallet after signup(Async)

### Login
1. username/email/phone-number
2. password
3. remember

- Create an AccessToken with HttpOnly(15min)
- Create a RefreshToken with HttpOnly(7days)

### Refresh
1. rotate refresh and access token

### Logout
1. Logout

### Password
1. Forgot Password - Reset
2. Change Password

## User

### Normal User
1. Manage Wallet
2. Create a bid
3. Delete own bid
4. Update own bid
5. Bid History

### Admin User
1. Application Management
2. Delete Bids
3. Update Bids
4. Users Management
5. Category Management

## Bid Structure

### Auction
1. Product
2. Status
3. Base Price
4. Creator-id
5. Start-at
6. End-at
7. Winner-id
8. Final-price

### Bid
1. Auction-id
2. User-id
3. Amount
4. Created-at

### Product
1. Main Picture
2. Other Pictures
3. Name
4. Category

### Category
1. Name
2. Slug

### Notification
1. User-id
2. Type
3. Title
4. Message
5. Is-read
6. Created-at
