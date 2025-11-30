const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust path if needed
require('dotenv').config();

async function checkUser() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const email = "wearvirtually@gmail.com";
        // We need to use the model. Since it's an ES module project, this script might fail if run with node directly without type module or babel.
        // Let's try to read the file content of User model to see if it's using ES exports.
        // Actually, it's better to use a script that runs within the Next.js environment or just use a standalone script with commonjs if possible, but the project is likely ES modules.

        // Alternative: Use the existing API? 
        // I can't easily run a script if the project is ESM and I don't have the loader setup.
        // I will try to use the browser to "Sign Up" first? 
        // If I try to sign up and it says "User already exists", then I know.
        // If it succeeds, then I have the user.

        // Let's use the browser to check/create the user. It's safer and tests the full flow.
    } catch (error) {
        console.error(error);
    }
}
