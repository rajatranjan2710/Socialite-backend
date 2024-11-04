import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      default:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQYCBAUDB//EADkQAAIBAwEFBAUKBwAAAAAAAAABAgMEEQUGEiExUUGRobETIjVhwTJCUmJjcnOBouEzNHGSwtHw/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7iAAAAAAHjdV4W9GVSc4xS7ZAeuTWr6ha0HirWin0XF+BW7/UK1zOUVWm6fRLdT/I0OCAti1uwfD0rT98H/o0620UYzap2++l870mF5FeyQB3Y7SPfW9ard7cT4+R2bK+oXsN6hPLXyovg1+RSDKhXqW9WNWjJxnHtAvwOXQ1uynQpzq1o05yXrReXhm/b3NC4jvUKsKi+qwPUAAAAAAAAAAAAB5160KFGdWo8RgssqN/e1L2tvzeIr5EeyJ3do3jT+eMzS/rzKw2AbMWCADIbDIbAhkMNkNgMnrY3Ts7qnXi2tx+tx5rt8DwbEJuE1KOMxeVlZQH0WLTimnlPkyTS0m5jdafRqQjurG6455NcDdAAAAAAAAAAADj7TfyFP8AFXkysstG0sc6dn6NSL818SrAGQwyGwIZDDIbANmLYbIAEMMhlFz2Y9k0/vy8zrHL2aWNHoPq5P8AUzqEAAAAAAAAAAAc7Xo72l1vdh9zKgdHXLupWv6tPffo6b3VHPDhz8TmtgQyGGQ2AbMWw2QAIYZDZRDIz1DIyBfdDh6PSbWP2affxN8pezF7VpalTt99ulVynFvgnjKa7vEuhAAAAAAAAAAAFH1VOOpXKa4+kb7+JqMsG01hLfV5STaxiol2e8rufeBLZi2GyABDDIZQZiwyGwDZi2GzFvHNgdLZ5OWtWqX0m/0svxWtk9MqUd69rxcXOO7TT547WWUgAAAAAAAAAAAzg7TWcI2Ua1GnGLpzzLdjjg/+R3jzuKUa9GdKoswnFxYHzwhnte287O5qUKnODxnquxngygzFhkMA2YthshgMlx2XsKa0yNatShKVSbnFyim0uSx3FW02zlf3lO3hni8yfSPaz6JShGnCMILEIpJLogMwAQAAAAAAAAAAAAAHE2nsadWyldPhVo8c9Vnkyn5L1tB7HuvurzRRCg2YthsxYAh8iTFhF62Zsadrp9OtHjUrxU5Sfv5I7Bo6J7IsvwYeRvEUAAAAAAAABDeEV/Uto1SqOlZQU2nh1JcvyAsJ417qhbrNetTpr60kilXGsX9x8u4lFdIer5GjJuTblxb5tgXG52jsKXCm51n9SPDvZyrnai5llW9CnTXY5Zk/gcEhlG1d6leXaar3E5RfOKeF3I02w2YsAAQwgzFhkMDctdWv7NKNC5qKEeUJPeXc+R1rba64hwurenUXWDcX45K22QwL5a7UabX4VJVKD+0jw70dWhdW9zHet61OrHrCSZ8sZMZShLehJxku2Lwwr6xkHze22g1S2wo3cpx6VfW8+JYtG2rhd1YW99TjSqT4RqRfqt+/oQWYAAc3aC5dtpdSUHiU8QT6Z/YpJaNr5YtKEetTPh+5VgIIYIZQbMWw2QwIAIYQZiwyGAbMWw2QwIZDDIAEMkxYBmLfQNkNgfTdnruV7o9tWm8z3d2Tfa1wz4EHO2Dk5aPVi/m3Ekv7Yv4kEVltj/CtfvS+BWGQAIMWSCjEgACGQyAEQzFkgDFmLJAGIYAGJDAAxMWSALxsB7Nufx/8USARX//Z",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_following: {
      type: Boolean,
      default: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    vlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vlog",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
