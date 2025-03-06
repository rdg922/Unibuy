# UniBuy 

Your one stop shop for all your Rohit item needs!

## Getting Started:

Copy .env.example and name it .env and set up client and secret

### UploadThing Configuration

1. Create an account at [uploadthing.com](https://uploadthing.com)
2. Create a new app in your dashboard
3. Copy your API Secret key to the .env file
4. This step is annoying, but you'll need to find you APP_ID for uploadthing in a roundabout way:

  - Upload an image using the uploadthing dashboard, 
  - Copy File URL
  - Extract the hostname (everything between https:// and /f/...)
  - Example:
    - My URL was `https://1gptmghytx.ufs.sh/f/C5NhfnxqJ3oXDgAFq4QpMVFK2kq0GrugB6xiIaWXDof79Ntc`
    - SO my hostname is `1gptmghytx.ufs.sh`

5. Paste your hostname in `next.config.js` in hostname property of 



```bash
npm install
```

Push to database
```
npm run db:push
```

Run locally:
```
npm start
```

## Email Verification:

Note: when creating an account, you will need to 'verify' your email, but for development environments, the 'email' will instead be printed in the console, go to the given redirect link to verify your email