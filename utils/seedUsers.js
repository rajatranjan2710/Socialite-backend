import { User } from "../models/user.modal.js";
import generateFakeUsers from "./fake.user.js";

export const seedUsers = async (count) => {
  try {
    const fakeUsers = generateFakeUsers(count);

    // Save users to the database
    await User.insertMany(fakeUsers);
    console.log(`${count} fake users created successfully!`);
  } catch (error) {
    console.error("Error seeding fake users:", error);
  }
};
