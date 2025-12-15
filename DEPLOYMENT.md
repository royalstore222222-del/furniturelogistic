# Deployment Guide for RoyalStore

This guide outlines the steps to deploy the RoyalStore application to Vercel.

## 1. Prerequisites

- A [Vercel](https://vercel.com/) account.
- A [GitHub](https://github.com/) account (recommended for continuous deployment).
- The project pushed to a GitHub repository.

## 2. Environment Variables

Before deploying, ensure you have the following environment variables ready. You will need to add these to your Vercel project settings.

| Variable Name | Description | Example / Location |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection string for your MongoDB database. | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | Secret used to encrypt session data. | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The canonical URL of your site. | `https://your-project.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name. | From Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret. | From Cloudinary Dashboard |
| `RESEND_API_KEY` | API Key for Resend (email service). | From Resend Dashboard |
| `GMAIL_USER` | (Optional) Gmail address if using Nodemailer. | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | (Optional) App Password for Gmail. | Generated in Google Account Security |
| `JWT_SECRET` | Secret for verifying JSON Web Tokens. | Generate a secure random string |

> **Note:** For `NEXTAUTH_URL`, initially set it to your Vercel deployment URL (e.g., `https://royalstore.vercel.app`). If you add a custom domain later, update this variable.

## 3. Deployment Steps (Vercel)

1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
2.  **Add New Project**: Click "Add New..." -> "Project".
3.  **Import Repository**: Select your GitHub repository for `royalstore` and click "Import".
4.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect "Next.js".
    - **Root Directory**: Ensure this is set to the root of your Next.js app (where `package.json` is). If your project is in a subdirectory (e.g., `project/project/royalstore`), click "Edit" and select that folder.
5.  **Environment Variables**:
    - Expand the "Environment Variables" section.
    - Copy and paste your variables from `.env` or the table above.
6.  **Deploy**: Click the "Deploy" button.

Vercel will build your application. If successful, you will be redirected to your dashboard with a screenshot of your live site!

## 4. Post-Deployment Verification

After deployment:
1.  **Check Build Logs**: Ensure there are no errors in the build logs.
2.  **Test Functionality**:
    - Register/Login a user.
    - Create a product (admin).
    - Add items to cart and proceed to checkout.
    - Test the contact form (email sending).
3.  **Check Logs**: View runtime logs in the Vercel dashboard "Functions" tab if you encounter any issues.

## 5. Troubleshooting

- **Build Fails**: Check the build logs carefully. Common issues include missing dependencies or linting errors (which we have fixed!).
- **Images Not Loading**: Check your `next.config.mjs` to ensure the hostname for your image provider (Cloudinary) is allowed.
- **Database Connection Error**: Verify `MONGODB_URI` in Vercel Environment Variables. Ensure your MongoDB Atlas IP Whitelist allows access from anywhere (0.0.0.0/0) or Vercel's IP range.

## 6. Important Notes

- **Cloudinary**: Ensure your Cloudinary credentials are correct to enable image uploads in the Tiptap editor.
- **Email**: If using Gmail, you MUST use an App Password, not your regular password. Resend is recommended for production.
