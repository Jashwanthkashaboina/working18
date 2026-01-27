import * as React from "react";
import { useState, useContext } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  Typography,
  Snackbar, Alert
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";

const theme = createTheme();

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0 - SignIn, 1 - SignUp
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // snack bar
  const [snackBarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const showSnackbar = (message, severity = 'error') =>{
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formState === 1) {
        await handleRegister(email, username, password);
        showSnackbar("Registration successful!", "success");
        setFormState(0);
        // setTimeout(() => {
        //     navigate("/login");
        // }, 1500);
      } else if(formState === 0){
        await handleLogin(username, password);
        showSnackbar("Login successful!", "success");

        // setTimeout(() => {
        //     navigate("/dashboard");
        // }, 1500);
      }
    } catch (err) {
    //   let message = err.response.data.message;
      showSnackbar(err?.response?.data?.message || "Something went wrong", "error");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ROOT FLEX CONTAINER */}
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
        }}
      >
        {/* LEFT IMAGE */}
        <Box
          sx={{
            width: "50%",
            display: { xs: "none", md: "block" },
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* RIGHT FORM */}
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
                  onClick={() => setFormState(0)}
                >
                  Sign In
                </Button>
                <Button
                  sx={{ ml: 1 }}
                  variant={formState === 1 ? "contained" : "outlined"}
                  onClick={() => setFormState(1)}
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
                />
              )}

              <TextField
                fullWidth
                margin="normal"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                fullWidth
                margin="normal"
                type="password"
                label="Password"
                value={password} // making form controlled 
                onChange={(e) => setPassword(e.target.value)}
              />

              <FormControlLabel
                control={<Checkbox />}
                label="Remember me"
              />

              {error && (
                <Typography color="error">{error}</Typography>
              )}

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

    <Snackbar 
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
        <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
        >
            { snackbarMessage }
        </Alert>    
    </Snackbar>
    </ThemeProvider>
  );
}
