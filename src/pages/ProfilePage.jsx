import { useContext, useEffect } from "react";
import {  Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfileSideBar from "../components/ProfileSideBar";
import ProfileMidBody from "../components/ProfileMidBody";
import { AuthContext } from "../components/AuthProvider";
import {getAuth} from "firebase/auth"

export default function ProfilePage() {
    const navigate = useNavigate();
    const auth = getAuth();
    const {currentUser} = useContext(AuthContext);
    //check for authToken imeediately upon componennt mount and whenevr authToken Changes
   // useEffect (() => {
        if(!currentUser) {
            navigate("/login");
        }
    //}, [currentUser, navigate]);

    const handleLogout = () => {
        auth.signOut(); 
    };

  return (
    <Container>
      <Row>
        <ProfileSideBar handleLogout={handleLogout} />
        <ProfileMidBody/>
      </Row>
    </Container>
  )
}