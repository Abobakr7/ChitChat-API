const mongoose = require("mongoose");
const faker = require("faker");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Request = require("../models/Request");

// Connect to MongoDB
mongoose.connect(process.env.DB_URI);

// Seed function
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Request.deleteMany({});

        // Create users
        const users = [];
        const passwords = [];
        for (let i = 0; i < 10; i++) {
            const realPassword = faker.internet.password();
            passwords.push(realPassword);
            const hashedPassword = await bcrypt.hash(realPassword, 8);
            const user = new User({
                name: faker.name.findName(),
                email: faker.internet.email().toLowerCase(),
                username: faker.internet.userName().toLowerCase(),
                password: hashedPassword,
                avatar: faker.image.avatar(),
            });
            users.push(user);
        }
        await User.insertMany(users);
        console.log("Users inserted");

        // Create requests
        const requests = [];
        for (let i = 0; i < 10; i++) {
            const requester = faker.random.arrayElement(users)._id;
            let requestee;
            do {
                requestee = faker.random.arrayElement(users)._id;
            } while (requestee.equals(requester)); // Ensure requestee is not the same as requester

            const request = new Request({
                requester,
                requestee,
            });
            requests.push(request);
        }
        await Request.insertMany(requests);
        console.log("Requests inserted");
        console.log(passwords);
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
