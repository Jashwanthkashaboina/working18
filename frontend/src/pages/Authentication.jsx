import { useState, useContext } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Global object
const theme = createTheme();

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0 - SignIn, 1 - SignUp
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});


  const { handleRegister, handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const switchForm = (state) => {
    setFormState(state);
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const validate = () => {
  const newErrors = {};

  if (formState === 1 && !email.trim()) {
    newErrors.email = "Email is required";
  }

  if (!username.trim()) {
    newErrors.username = "Username is required";
  }

  if (!password.trim()) {
    newErrors.password = "Password is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validate()){
      toast.error('Please Fill all required details');
      return;
    }
    try {
      if (formState === 1) {
        await handleRegister(email, username, password);
        await handleLogin(username, password);

        toast.success("Registration successful!");
      } else {
        await handleLogin(username, password);
        toast.success("Login successful!");
      }
      
      navigate("/home");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <Toaster position="top-center" /> */}

      <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
        <Box
          sx={{
            width: "50%",
            display: { xs: "none", md: "block" },
            backgroundImage: "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Paper
          elevation={6}
          square
          sx={{
            width: { xs: "100%", md: "50%" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "80%", maxWidth: 420 }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Avatar sx={{ m: "auto", bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>

              <Box sx={{ mt: 1 }}>
                <Button
                  variant={formState === 0 ? "contained" : "outlined"}
                  onClick={() => switchForm(0)}
                >
                  Sign In
                </Button>

                <Button
                  sx={{ ml: 1 }}
                  variant={formState === 1 ? "contained" : "outlined"}
                  onClick={() => switchForm(1)}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              {formState === 1 && (
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              )}

              <TextField
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
              />

              <TextField
                fullWidth
                margin="normal"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
              >
                {formState === 1 ? "Sign Up" : "Sign In"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
