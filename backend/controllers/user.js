import User from "../models/user.js";
import bcrypt from "bcrypt";
import Meeting from "../models/meeting.js";
import jwt from "jsonwebtoken";

/* === LOGIN === */

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  // Extracts salt from stored hash
  // Hashes the entered password again
  // Compares hashes
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ token });
};

/* === SIGNUP === */

const signup = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong ${e}` });
  }
};


/* === GET HISTORY === */

const getUserHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({ user_id: req.user.id });

    res.status(200).json(meetings);
  } catch (e) {
    res
      .status(500)
      .json({ message: `Something went wrong ${e}` });
  }
};

/* === ADD HISTORY === */

const addToHistory = async (req, res) => {
  try {
    const { meeting_code } = req.body;

    const newMeeting = new Meeting({
      user_id: req.user.id, 
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    res
      .status(201)
      .json({ message: "Added code to history" });
  } catch (e) {
    res
      .status(500)
      .json({ message: `Something went wrong ${e}` });
  }
};

export { login, signup, getUserHistory, addToHistory };
