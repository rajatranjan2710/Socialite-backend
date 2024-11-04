import jwt from "jsonwebtoken";

export const generateToken = (id, res) => {
  try {
    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.cookie("socialite", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 2,
    });
    console.log("cookie set successfully");
  } catch (error) {
    console.log("error setting cookie :", error);
  }
};
