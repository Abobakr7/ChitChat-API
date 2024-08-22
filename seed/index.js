const mongoose = require("mongoose");
const faker = require("faker");
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
        for (let i = 0; i < 10; i++) {
            const user = new User({
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                status: faker.random.arrayElement(["online", "offline"]),
                lastSeen: faker.date.recent(),
                avatar: faker.image.avatar(),
                resetPasswordToken: faker.datatype.uuid(),
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
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDatabase();
