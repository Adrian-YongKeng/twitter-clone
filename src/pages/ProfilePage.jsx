import { useEffect } from "react";
import {  Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import ProfileSideBar from "../components/ProfileSideBar";
import ProfileMidBody from "../components/ProfileMidBody";

export default function ProfilePage() {
    const [authToken, setAuthToken] = useLocalStorage("authToken", "");
    const navigate = useNavigate();
    //check for authToken imeediately upon componennt mount and whenevr authToken Changes
    useEffect (() => {
        if(!authToken) {
            navigate("/login");
        }
    }, [authToken, navigate]);
    // Render the page content only when the user is authenticated
    if (!authToken) {
      return null; // Render nothing if not authenticated
    }

    const handleLogout = () => {
        setAuthToken(""); //clear token from lcoalstorage
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