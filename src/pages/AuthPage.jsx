import { FacebookAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import {Col, Image, Row,  Modal, Form, Button, Alert} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";

export default function AuthPage () {
    const loginImage = "https://sig1.co/img-twitter-1";
   
    //possible values: null(no modal show, login , signup)
    const [modalShow, setModalShow] = useState(null);
    const handleShowSignUp = () => setModalShow("SignUp");
    const handleShowLogin = () => setModalShow("Login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const [signupMessage, setSignupMessage] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(null); // Password strength error message
    //login error state
    const [loginMessage, setLoginMessage] = useState(null);
    const [showSuccess, setShowSuccess] = useState(null);

    const auth = getAuth();
    const {currentUser} = useContext(AuthContext);
    const provider = new GoogleAuthProvider();
    const fbProvider = new FacebookAuthProvider();

    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    const [showPhoneLoginModal, setShowPhoneLoginModal] = useState(false);
    const [phoneNumber, setPhoneNumber] =useState("");
    const [code, setCode] =useState("");
    const [verificationId, setVerificationId] = useState(null);


    useEffect(() => {
        console.log(currentUser)
        if(currentUser) navigate("/profile");
    }, [currentUser, navigate])
   // useEffect (() => {
   //     if(authToken) {
   //         navigate("/profile");
   //     }
   // }, [authToken, navigate]);

    const isStrongPassword = (password) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        return passwordRegex.test(password);
    }

    const handleSignUp = async (e) =>  {
        e.preventDefault();
        setSignupMessage(null); // Clear the username error message
        if (!isStrongPassword(password)){
            setPasswordStrength("Your password must be at least 8 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character (e.g., !, @, #, $).");
            return; // Don't proceed with the signup
        }
        try {
            const res = await createUserWithEmailAndPassword(auth, username, password);
            console.log(res.user);
            if (res.status === 201) { // User registered successfully
                setShowSuccess(res.data.message);
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                // If the response status is 400, it's a client-side error (username already taken)
                setSignupMessage(error.response.data.message); //(username already taken)
                setPasswordStrength(null); // Set passwordStrength to null
              } else {
                //  errors message from server
                setSignupMessage(error.response.data.message);
              }
        }
    };

    const handleLogin = async (e) =>  {
        e.preventDefault();
        setLoginMessage(null)
        try {
            await signInWithEmailAndPassword(auth, username, password);
            console.log(currentUser)
        } catch (error) {

            if (error.code === 'auth/invalid-email') {
                setLoginMessage("Invalid email format.");
            } else if (error.code === 'auth/user-disabled') {
                setLoginMessage("This user account has been disabled.");
            } else if (error.code === 'auth/user-not-found') {
                setLoginMessage("User not found. Please check your email.");
            } else if (error.code === 'auth/wrong-password') {
                setLoginMessage("Incorrect password. Please try again.");
            }  else {
                setLoginMessage("Login failed. Please try again.");
            }
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try{
            await signInWithPopup(auth, provider);
        }catch(error) {
            console.error(error)
        }
    }
    const handleFacebookLogin = async (e) => {
        e.preventDefault();
        try{
            await signInWithPopup(auth, fbProvider);
        }catch(error) {
            console.error(error)
        }
    }

    const showResetModal = () => {
        setShowPasswordResetModal(true);
        setModalShow(null);
    };
    const handlePasswordReset = (email) => {
        sendPasswordResetEmail(auth, email)
        .then (() => {
            // Inform the user that the email has been sent
            alert("Password reset email sent!");
            setShowPasswordResetModal(false);
            setResetEmail("");
            setModalShow(true);
        })
        .catch((error) => {
            console.error("Error sending password reset email: ", error);
            alert("Failed to send password reset email. Please try again.");
        })
    }


    const handleClose = () => {
        setModalShow(null);
        setSignupMessage(null);
        setPasswordStrength(null);
        setLoginMessage(null);
        setShowSuccess(null);
    };

    return (
        <Row>
            <Col>
                <Image src={loginImage} fluid />
            </Col>
            <Col sm={6} className="p-4">
                <i className="bi bi-twitter" style={{ fontSize: 50, color: "dodgerblue"}}></i>

                <p className="mt-5" style={{fontSize: 64}}>Happening Now</p>
                <h2 className="my-5" style={{fontSize: 31}}>Join Twitter Today</h2>

                <Col sm={5} className="d-grid gap-2">
                    <Button className="rounded-pill" variant="outline-dark" onClick={handleGoogleLogin}>
                        <i className="bi bi-google"></i> Sign Up with Google
                    </Button>
                    <Button className="rounded-pill" variant="outline-dark" onClick={handleFacebookLogin}>
                        <i className="bi bi-facebook"></i> Sign Up with Facebook
                    </Button>
                    <p style={{textAlign: "center"}}>or</p>
                    <Button className="rounded-pill" onClick={handleShowSignUp}>
                        Create an account
                    </Button>
                    <p style={{fontSize: "12px"}}>
                        By signing up, you agree to the Terms of Service and Privay Policy including Cookie Use.
                    </p>

                    <p className="mt-5" style={{fontWeight: "bold"}}>
                        Already have an account?
                    </p>
                    <Button 
                        className="rounded-pill" 
                        variant="outline-primary"
                        onClick={handleShowLogin}
                    >
                        Sign In
                    </Button>
                    <Button 
                        className="rounded-pill" 
                        variant="outline-primary"
                        onClick={() => showPhoneLoginModal}
                    >
                        <i className="bi bi-telephone-fill"></i> Sign In with Phone
                    </Button>
                </Col>
                <Modal 
                    show={modalShow !== null}
                    onHide={handleClose} 
                    animation= {false}
                    centered
                >
                    <Modal.Body>
                        <h2 className="mb-4" style={{fontWeight: "bold"}}>
                            {modalShow === "SignUp"
                            ? "Create your account"
                            : "Log in to your account"}
                        </h2>
                        
                        <Form 
                            className="d-grid gap-2 px-5" 
                            onSubmit={modalShow === "SignUp" ? handleSignUp: handleLogin}
                        > 
                            <Form.Group className="mb-3" controlId= "formBasicEmail">
                                <Form.Control 
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="email" 
                                    placeholder="Enter Username"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId= "formBasicPassword">
                                <Form.Control 
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password" 
                                    placeholder="Password"
                                />
                                {modalShow === "Login" && (
                                    <p onClick={showResetModal} className="text-primary" style={{ cursor: "pointer" }}>
                                        Forgot password?
                                    </p>
                                )}
                            </Form.Group>
                            
                            {showSuccess ? (
                                <Alert variant="success">
                                    {showSuccess}
                                </Alert>
                            ) : (
                                <div>
                                    {modalShow === "SignUp" && signupMessage && (
                                        <Alert variant="danger">
                                            {signupMessage}
                                        </Alert>
                                    )}
                                    {modalShow === "SignUp" && passwordStrength && (
                                        <Alert variant="danger">
                                            {passwordStrength}
                                        </Alert>
                                    )}
                                 
                                </div>
                            )}
                            
                            {modalShow === "Login" && loginMessage && ( //display error only in loginModal
                                <div className="alert alert-danger" role="alert">
                                    <img src="./src/assets/!image.png" style={{ width: '25px', height: '25px' }} className="mx-2"/> 
                                    {loginMessage}
                                </div>
                            )}
                        
                            <p style={{fontSize: "12px"}}>
                                By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use. 
                                SigmaTweets may use your contact information, including your email address and phone number for purposes outlined in our Privacy Policy,
                                like keeping your account seceure and personalising our services, including ads. Learn more. Others will be able to find you by email or phone number, 
                                when provided, unless you choose otherwise here.
                            </p>

                            <Button className="rounded-pill" type="submit">
                                {modalShow === "SignUp" ? "Sign up": "Log in"}
                            </Button>
                            
                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal show={showPasswordResetModal} onHide={() => setShowPasswordResetModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        handlePasswordReset(resetEmail);
                    }}>
                        <Form.Group>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required 
                                className="mb-4"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Send Reset Email
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showPhoneLoginModal} onHide={() => setShowPhoneLoginModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Phone Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control 
                                type="tel" 
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </Form.Group>
                        {verificationId && (
                            <Form.Group>
                                <Form.Label>Verification Code</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter verification code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </Form.Group>
                        )}
                        
                    </Form>
                </Modal.Body>
            </Modal>

            </Col>
        </Row>
    )
}