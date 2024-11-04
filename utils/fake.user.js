import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

// Function to generate a single fake user
const generateFakeUser = () => {
  return {
    username: faker.internet.userName(),
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(), // Normally you'd hash this
    profile_picture: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    location: faker.location.city(),
    website: faker.internet.url(),
    is_verified: faker.datatype.boolean(),
    is_following: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
};

// Function to generate multiple fake users
const generateFakeUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateFakeUser());
  }
  return users;
};

// Example: Generating 10 fake users
// const fakeUsers = generateFakeUsers(10);
// console.log(fakeUsers);

export default generateFakeUsers;
